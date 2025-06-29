// user.controller.js
const { PrismaClient } = require('@prisma/client');
// const bcrypt = require('bcryptjs');
const hash = require('../../middlewares/bcrypt.middleware.js');
const { listGymMedia } = require('../../utils/aws.upload.js'); // Assuming you have this utility for AWS S3 uploads
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


async function getGymById(req, res) {
  const { gymId } = req.params;

  try {
    // 1) Fetch gym + all relations
    const gym = await prisma.gyms.findUnique({
      where: { gym_id: gymId },
      include: {
        gym_info: true,
        gym_types: true,
        gym_amenities: { include: { amenities: true } },
        gym_services: { include: { services: true } },
        memberships: true,
        gym_activities: { include: { activities: true } },
        staff: true,
        events: true,
      }
    });

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found.' });
    }

    // 2) Filter & reshape
    const info       = gym.gym_info.filter(i => !i.is_deleted);
    const type       = gym.gym_types; // no deleted flag on types
    const amenities  = gym.gym_amenities
                           .map(x => x.amenities)
                           .filter(a => !a.is_deleted);
    const services   = gym.gym_services
                           .map(x => x.services)
                           .filter(s => !s.is_deleted);
    const memberships= gym.memberships
                           .filter(m => !m.is_deleted && m.status === 'active')
                           .map(({ membership_id, name, description, duration_days, price_rupees }) => 
                             ({ membership_id, name, description, duration_days, price_rupees })
                           );
    const activities = gym.gym_activities
                           .map(x => x.activities)
                           .filter(a => !a.is_deleted);
    const staff      = gym.staff.filter(s => !s.is_deleted);
    const events     = gym.events.filter(e => !e.is_deleted);

    // 3) Fetch AWS media
    const photos = await listGymMedia(gymId, 'photos');
    const videos = await listGymMedia(gymId, 'videos');

    // 4) Build final payload
    const result = {
      gym_id: gym.gym_id,
      created_at: gym.created_at,
      is_deleted: gym.is_deleted,

      gym_info:        info,
      gym_type:        type,
      amenities,
      services,
      memberships,
      activities,
      staff,
      events,

      media: { photos, videos }
    };

    return res.json(result);
  }
  catch (err) {
    console.error('Error fetching gym by ID:', err);
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
  getGymById,
  getMemberships
};
