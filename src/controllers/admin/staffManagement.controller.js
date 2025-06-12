// staffManagement.controller.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const hash = require('../../middlewares/bcrypt.middleware.js');

// Allowed staff types (must match Prisma enum)
const ALLOWED_STAFF_TYPES = ['manager', 'housekeeping', 'basic_staff'];

// Create new staff + user credentials
const createStaff = async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      user_profile,
      name,
      staff_type,
      bio,
      photo_url,
      gym_id
    } = req.body;

    // Validate staff_type
    if (!ALLOWED_STAFF_TYPES.includes(staff_type)) {
      return res.status(400).json({ error: `Invalid staff_type. Allowed: ${ALLOWED_STAFF_TYPES.join(', ')}` });
    }

    // Validate gym existence
    const gym = await prisma.gyms.findUnique({ where: { gym_id } });
    if (!gym || gym.is_deleted) {
      return res.status(400).json({ error: 'Invalid gym_id: Gym does not exist' });
    }

    // 1. Create user
    const hashedPassword = await hash.hashPassword(password);
    const newUser = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        phone,
        role: 'staff'
      }
    });

    // 2. Create staff linked to user
    const newStaff = await prisma.staff.create({
      data: {
        user_id: newUser.user_id,
        name,
        staff_type,
        bio,
        photo_url,
        phone,
        email,
        gym_id
      },
      include: {
        users: true,
        gyms: true
      }
    });

    res.status(201).json({ user: newUser, staff: newStaff });
  } catch (error) {
    console.error('Error creating staff + user:', error);
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Foreign key constraint failed. Check inputs.' });
    }
    res.status(400).json({ error: error.message });
  }
};

// Update staff details and user credentials
const updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      user_profile,
      name,
      staff_type,
      bio,
      photo_url,
      gym_id
    } = req.body;

    const existing = await prisma.staff.findUnique({
      where: { staff_id: staffId },
      include: { users: true }
    });
    if (!existing || existing.is_deleted) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Validate staff_type if provided
    if (staff_type && !ALLOWED_STAFF_TYPES.includes(staff_type)) {
      return res.status(400).json({ error: `Invalid staff_type. Allowed: ${ALLOWED_STAFF_TYPES.join(', ')}` });
    }

    // Validate gym for update
    if (gym_id) {
      const gym = await prisma.gyms.findUnique({ where: { gym_id } });
      if (!gym || gym.is_deleted) {
        return res.status(400).json({ error: 'Invalid gym_id: Gym does not exist' });
      }
    }

    // Update user data
    const userData = { email, first_name, last_name, phone, updated_at: new Date() };
    if (password) {
      userData.password_hash = await hash.hashPassword(password);
    }
    if (user_profile) {
      userData.user_profiles = {
        upsert: {
          where: { user_id: existing.user_id },
          create: user_profile,
          update: user_profile
        }
      };
    }
    const updatedUser = await prisma.users.update({
      where: { user_id: existing.user_id },
      data: userData
    });

    // Update staff data
    const updatedStaff = await prisma.staff.update({
      where: { staff_id: staffId },
      data: {
        ...(name !== undefined && { name }),
        ...(staff_type !== undefined && { staff_type }),
        ...(bio !== undefined && { bio }),
        ...(photo_url !== undefined && { photo_url }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(gym_id !== undefined && { gym_id })
      },
      include: { users: true, gyms: true }
    });

    res.status(200).json({ user: updatedUser, staff: updatedStaff });
  } catch (error) {
    console.error('Error updating staff + user:', error);
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Foreign key constraint failed. Check inputs.' });
    }
    res.status(400).json({ error: error.message });
  }
};

// The other functions remain unchanged
const getAllStaff = async (req, res) => { /* ... */ };
const getStaffById = async (req, res) => { /* ... */ };
const deleteStaff = async (req, res) => { /* ... */ };

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff
};
