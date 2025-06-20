//gymManagement Controller
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
  uploadGymMedia,
  listGymMedia,
  deleteGymMedia,
} = require('../../utils/aws.upload');

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
      gym_type_id,
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
        gym_info: true,
      },
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
      include: { gym_info: true, gym_types: true },
    });
    res.status(200).json(gyms);
  } catch (error) {
    console.error('Error fetching gyms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get gym by ID
const getGymById = async (req, res) => {
  try {
    const { gymId } = req.params;

    const gym = await prisma.gyms.findUnique({
      where: { gym_id: gymId },
      include: { gym_info: true, gym_types: true },
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

// Update gym and its info
// Update gym and its info
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
      gym_type_id,
    } = req.body;

    // Fetch existing gym and its info array
    const existingGym = await prisma.gyms.findUnique({
      where: { gym_id: gymId },
      include: { gym_info: true },
    });

    if (!existingGym) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    // Update the gym_type
    await prisma.gyms.update({
      where: { gym_id: gymId },
      data: { gym_type_id },
    });

    // Prepare opening hours string if provided
    const hours = open_time && close_time ? `${open_time} - ${close_time}` : undefined;

    if (Array.isArray(existingGym.gym_info) && existingGym.gym_info.length > 0) {
      // Take the first info record
      const infoId = existingGym.gym_info[0].info_id;

      await prisma.gym_info.update({
        where: { info_id: infoId },
        data: {
          name,
          address,
          city,
          contact_number: phone_number,
          opening_hours: hours,
          latitude,
          longitude,
          google_maps_url,
        },
      });
    } else {
      // No existing info record: create one
      await prisma.gym_info.create({
        data: {
          gym_id: gymId,
          name,
          address,
          city,
          contact_number: phone_number,
          opening_hours: hours,
          latitude,
          longitude,
          google_maps_url,
        },
      });
    }

    // Return the fully updated gym
    const updatedGym = await prisma.gyms.findUnique({
      where: { gym_id: gymId },
      include: { gym_info: true, gym_types: true },
    });

    res.status(200).json(updatedGym);

  } catch (error) {
    console.error('Error updating gym:', error);
    res.status(400).json({ error: error.message });
  }
};





// Soft-delete gym
const deleteGym = async (req, res) => {
  try {
    const { gymId } = req.params;

    await prisma.gyms.update({
      where: { gym_id: gymId },
      data: { is_deleted: true },
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
      where: {
        gym_type_id: gymTypeId,
        is_deleted: false,
      },
      include: { gym_info: true, gym_types: true },
    });

    res.status(200).json(gyms);
  } catch (error) {
    console.error('Error fetching gyms by type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get gyms nearby (simple range search)
const getGymsNearby = async (req, res) => {
  try {
    const { lat, lng, radiusDeg = 0.05 } = req.query;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    const gyms = await prisma.gyms.findMany({
      where: {
        is_deleted: false,
        gym_info: {
          every: {
            latitude: {
              gte: latNum - radiusDeg,
              lte: latNum + radiusDeg,
            },
            longitude: {
              gte: lngNum - radiusDeg,
              lte: lngNum + radiusDeg,
            },
          },
        },
      },
      include: { gym_info: true },
    });

    res.status(200).json(gyms);
  } catch (error) {
    console.error('Error fetching nearby gyms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const uploadMediaHandler = async (req, res) => {
  const { gymId } = req.params;
  const files = req.files; // populated by multer

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }

  try {
    const results = await Promise.all(
      files.map(file => {
        // decide folder by mimetype
        const folder = file.mimetype.startsWith('image/')
          ? 'photos'
          : file.mimetype.startsWith('video/')
            ? 'videos'
            : null;

        if (!folder) {
          throw new Error(`Unsupported file type: ${file.mimetype}`);
        }

        return uploadGymMedia(
          gymId,
          file.buffer,          // from multer.memoryStorage
          file.originalname,    // preserve name + extension
          folder,
          'public-read'
        );
      })
    );

    res.json({ uploaded: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// GET /gyms/:gymId/media?type=photos
const listMediaHandler = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { type } = req.query;
    const items = await listGymMedia(gymId, type);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /gyms/:gymId/media
// body: { key: 'gym_123/photos/1612345678_img.jpg' }
const deleteMediaHandler = async (req, res) => {
  try {
    const { key } = req.body;
    await deleteGymMedia(key);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createGym,
  getAllGyms,
  getGymById,
  updateGym,
  deleteGym,
  getGymsByType,
  getGymsNearby,
  uploadMediaHandler,
  listMediaHandler,
  deleteMediaHandler,
};
