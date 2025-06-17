// controllers/userAuth.controller.js
require('dotenv').config();             // must be at the very top
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const hash = require('../../middlewares/bcrypt.middleware.js');

const prisma = new PrismaClient();

// Load from .env, with sane defaults
const JWT_SECRET     = process.env.JWT_SECRET     || 'fallback_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';  // e.g. '1h', '7d'

/** Helper: Convert '1d','2h','30m' → milliseconds */
function parseDuration(msString) {
  const m = msString.match(/^(\d+)([smhd])$/);
  if (!m) return 24*3600*1000;
  const [_, val, unit] = m;
  const v = parseInt(val, 10);
  const mult = { s: 1000, m: 60*1000, h: 3600*1000, d: 24*3600*1000 };
  return v * (mult[unit] || mult.d);
}

/**
 * Login controller
 */
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await prisma.users.findUnique({
      where: { email },
      include: { user_profiles: true }
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Sign JWT
    const payload = { userId: user.user_id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Set HTTP‑only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseDuration(JWT_EXPIRES_IN)
    });

    // Respond with sanitized user
    const { password_hash, ...safeUser } = user;
    return res.status(200).json({
      message: 'Login successful.',
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * Register controller
 */
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

    // Sign JWT
    const payload = { userId: user.user_id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseDuration(JWT_EXPIRES_IN)
    });

    // Only return non-sensitive fields
    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * Logout controller
 */
async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return res.status(200).json({ message: 'Logout successful.' });
}

module.exports = {
  login,
  register,
  logout
};
