// userAuth.controller.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const hash = require('../../middlewares/bcrypt.middleware.js');

const prisma = new PrismaClient();

// Login controller
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Register controller
async function register(req, res) {
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
    return res.status(201).json({ message: 'User registered', user_id: user.user_id });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

// Logout controller
async function logout(req, res) {
  // If using stateless JWT, "logout" is client-side (e.g., token deletion)
  // Optionally, implement token blacklist in DB or Redis
  res.status(200).json({ message: 'Logout successful (client should delete the token)' });
}

module.exports = {
  login,
  register,
  logout
};
