// src/controllers/user.controller.js
const { PrismaClient, user_role_enum } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const crypto = require('crypto');

exports.registerUser = async (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;

  try {
    // 1. Prevent duplicate emails
    const existing = await prisma.users.findUnique({ where: { "email" : email } });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user
    const newUser = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        role: user_role_enum[role] || user_role_enum.member,
      },
    });

    // 4. Create the user profile
    const newProfile = await prisma.user_profiles.create({
      data: {
        user_id: newUser.user_id,
        gender: null,
        food_preferences: [],
        lifestyle: {},
      },
    });

    // 5. Respond with both records
    return res.status(201).json({
      user: newUser,
      profile: newProfile,
    });

  } catch (err) {
    console.error("RegisterUser Error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    await prisma.$disconnect();
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { user_id: id },
      include: {
        user_profiles: true,
        user_memberships: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    console.error("GetUserById Error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    await prisma.$disconnect();
  }
};


exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { first_name , last_name , phone   } = req.body;

  try {
    const updatedUser = await prisma.users.update({
      where: { user_id: id },
      data: {
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        phone: phone ?? null,
        updated_at: new Date(),
      },
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const {
    date_of_birth,
    gender,
    height_cm,
    weight_kg,
    food_preferences,
    lifestyle,
  } = req.body;

  try {
    const existingProfile = await prisma.user_profiles.findFirst({
      where: { user_id: id },
    });

    if (!existingProfile) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const updatedProfile = await prisma.user_profiles.update({
      where: { profile_id: existingProfile.profile_id },
      data: {
        date_of_birth: date_of_birth ?? null,
        gender: gender ?? null,
        height_cm: height_cm ?? null,
        weight_kg: weight_kg ?? null,
        food_preferences: food_preferences ?? [],
        lifestyle: lifestyle ?? {},
      },
    });

    res.status(200).json(updatedProfile);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        user_profiles: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3. Return user info (exclude password_hash)
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    await prisma.$disconnect();
  }
};



// forgot password

// Store reset tokens in-memory (temporary, for dev only)
const resetTokens = {};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    const token = crypto.randomBytes(20).toString('hex');
    resetTokens[token] = { userId: user.user_id, expiresAt: Date.now() + 3600000 }; // 1 hr expiry

    // Simulate sending email
    console.log(`Reset Link: http://localhost:4000/api/users/reset-password?token=${token}`);

    res.json({ message: "Reset link sent (check console)" });
  } catch (err) {
    console.error("ForgotPassword Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// reset password

exports.resetPassword = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }
  const {  newPassword } = req.body;

  const record = resetTokens[token];
  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { user_id: record.userId },
      data: {
        password_hash: hashed,
        updated_at: new Date(),
      },
    });

    // Clean up token
    delete resetTokens[token];

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("ResetPassword Error:", err);
    res.status(500).json({ error: err.message });
  }
};


