// gymManagement.controller.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new gym with detailed info
const createGym = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      phone_number,
      open_time,
      close_time,
      latitude,
      longitude,
      google_maps_url,
      gym_type_id
    } = req.body;

    const newGym = await prisma.gyms.create({
      data: {
        gym_type_id,
        gym_info: {
          create: {
            name,
            address,
            city,
            contact_number: phone_number,
            opening_hours: `${open_time} - ${close_time}`,
            latitude,
            longitude,
            google_maps_url,
          },
        },
      },
      include: {
        gym_info: true
      }
    });

    res.status(201).json(newGym);
  } catch (error) {
    console.error('Error creating gym:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all gyms (not deleted)
const getAllGyms = async (req, res) => {
  try {
    const gyms = await prisma.gyms.findMany({
      where: { is_deleted: false },
      include: { gym_info: true, gym_types: true }
    });
    res.status(200).json(gyms);
  } catch (error) {
    console.error('Error fetching gyms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single gym by ID
const getGymById = async (req, res) => {
  try {
    const { gymId } = req.params;
    const gym = await prisma.gyms.findUnique({
      where: { gym_id: gymId },
      include: { gym_info: true, gym_types: true }
    });
    if (!gym || gym.is_deleted) {
      return res.status(404).json({ error: 'Gym not found' });
    }
    res.status(200).json(gym);
  } catch (error) {
    console.error('Error fetching gym by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a gym and its info
const updateGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const {
      name,
      address,
      city,
      phone_number,
      open_time,
      close_time,
      latitude,
      longitude,
      google_maps_url,
      gym_type_id
    } = req.body;

    const existingGym = await prisma.gyms.findUnique({
      where: { gym_id: gymId },
      include: { gym_info: true }
    });

    if (!existingGym) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    const gymInfoId = existingGym.gym_info?.info_id;
    if (!gymInfoId) {
      return res.status(404).json({ error: 'Gym info not found for this gym' });
    }

    const updatedGym = await prisma.gyms.update({
      where: { gym_id: gymId },
      data: {
        gym_type_id,
        gym_info: {
          update: {
            where: { info_id: gymInfoId },
            data: {
              name,
              address,
              city,
              contact_number: phone_number,
              opening_hours: open_time && close_time ? `${open_time} - ${close_time}` : undefined,
              latitude,
              longitude,
              google_maps_url,
            },
          },
        },
      },
      include: { gym_info: true }
    });

    res.status(200).json(updatedGym);
  } catch (error) {
    console.error('Error updating gym:', error);
    res.status(400).json({ error: error.message });
  }
};

// Soft-delete a gym
const deleteGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    await prisma.gyms.update({
      where: { gym_id: gymId },
      data: { is_deleted: true }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting gym:', error);
    res.status(400).json({ error: error.message });
  }
};

// List gyms by type
const getGymsByType = async (req, res) => {
  try {
    const { gymTypeId } = req.params;
    const gyms = await prisma.gyms.findMany({
      where: { gym_type_id: gymTypeId, is_deleted: false },
      include: { gym_info: true }
    });
    res.status(200).json(gyms);
  } catch (error) {
    console.error('Error fetching gyms by type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Simple “nearby” search within X degrees (~111km per degree)
const getGymsNearby = async (req, res) => {
  try {
    const { lat, lng, radiusDeg = 0.05 } = req.query;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    const gyms = await prisma.gyms.findMany({
      where: {
        is_deleted: false,
        gym_info: {
          every: {
            latitude: { gte: latNum - radiusDeg, lte: latNum + radiusDeg },
            longitude: { gte: lngNum - radiusDeg, lte: lngNum + radiusDeg },
          }
        }
      },
      include: { gym_info: true }
    });

    res.status(200).json(gyms);
  } catch (error) {
    console.error('Error fetching nearby gyms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createGym,
  getAllGyms,
  getGymById,
  updateGym,
  deleteGym,
  getGymsByType,
  getGymsNearby
};
