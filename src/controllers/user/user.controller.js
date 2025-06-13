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
        role: true
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
  const { first_name, last_name, phone } = req.body;
  try {
    const updated = await prisma.users.update({
      where: { user_id: userId },
      data: { first_name, last_name, phone },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true
      }
    });
    return res.status(200).json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

// List all gyms (non-deleted), flattening gym_info
async function getGyms(req, res) {
  try {
    const gyms = await prisma.gyms.findMany({
      where: { is_deleted: false },
      include: {
        gym_info: {
          where: { is_deleted: false },
          select: {
            address: true,
            city: true,
            contact_number: true,
            opening_hours: true,
            google_maps_url: true
          }
        }
      }
    });

    // Flatten the first gym_info record into the gym object
    const result = gyms.map(g => {
      const info = g.gym_info[0] || {};
      return {
        gym_id: g.gym_id,
        gym_type_id: g.gym_type_id,
        created_at: g.created_at,
        address: info.address || null,
        city: info.city || null,
        contact_number: info.contact_number || null,
        opening_hours: info.opening_hours || null,
        google_maps_url: info.google_maps_url || null
      };
    });

    return res.status(200).json(result);
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
