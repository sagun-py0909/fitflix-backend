// user.controller.js
const { PrismaClient } = require('@prisma/client');
// const bcrypt = require('bcryptjs');
const hash = require('../../middlewares/bcrypt.middleware.js');
const prisma = new PrismaClient();

// Register a new user
async function registerUser(req, res) {
  const { email, password, first_name, last_name, phone } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }
  try {
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const password_hash = await hash.hashPassword(password, 10);
    const user = await prisma.users.create({
      data: { email, password_hash, first_name, last_name, phone: phone || null }
    });
    return res
      .status(201)
      .json({ message: 'User registered successfully', user: { user_id: user.user_id, email: user.email } });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}



// Get current user profile
async function getProfile(req, res) {
  const userId = req.user.userId;
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        user_profiles: true
      }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

// Update current user profile
async function updateProfile(req, res) {
  const userId = req.user.userId;
  const { first_name, last_name, phone, date_of_birth, gender, address, city, state, zip_code, country, profile_picture_url } = req.body;

  try {
    // Update user's basic information
    const updatedUser = await prisma.users.update({
      where: { user_id: userId },
      data: { first_name, last_name, phone },
    });

    // Update or create user profile
    const updatedProfile = await prisma.user_profiles.upsert({
      where: { user_id: userId },
      update: {
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
        gender,
        address,
        city,
        state,
        zip_code,
        country,
        profile_picture_url,
      },
      create: {
        user_id: userId,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
        gender,
        address,
        city,
        state,
        zip_code,
        country,
        profile_picture_url,
      },
    });

    // Fetch the complete user object with updated profile
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        user_profiles: true,
      },
    });

    return res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

// List all gyms (non-deleted), flattening gym_info
// List all gyms (non-deleted) with gym_info and gym_type included
async function getGyms(req, res) {
  try {
    const gyms = await prisma.gyms.findMany({
      where: { is_deleted: false },
      include: {
        gym_info: {
          where: { is_deleted: false }
        },
        gym_types: true
      }
    });

    return res.status(200).json(gyms);
  } catch (err) {
    console.error('Gyms error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}


// List active, non-deleted memberships for a given gym
async function getMemberships(req, res) {
  const { gymId } = req.params;
  try {
    const memberships = await prisma.memberships.findMany({
      where: {
        gym_id: gymId,
        is_deleted: false,
        status: 'active'
      },
      select: {
        membership_id: true,
        name: true,
        description: true,
        duration_days: true,
        price_rupees: true,
        features: true
      }
    });
    return res.status(200).json(memberships);
  } catch (err) {
    console.error('Memberships error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  registerUser,
  getProfile,
  updateProfile,
  getGyms,
  getMemberships
};
