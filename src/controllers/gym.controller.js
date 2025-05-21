const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all gyms
exports.getAllGyms = async (req, res) => {
  try {
    const gyms = await prisma.gyms.findMany({
      include: {
        gym_types: true,
        memberships: true,
        gym_info: true,
      },
    });
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gyms' });
  }
};

// GET single gym by ID
exports.getGymById = async (req, res) => {
  const { id } = req.params;
  try {
    const gym = await prisma.gyms.findUnique({
      where: { gym_id: id },
      include: {
        gym_types: true,
        memberships: true,
        gym_info: true,
      },
    });

    if (!gym) return res.status(404).json({ error: 'Gym not found' });
    res.json(gym);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gym' });
  }
};

/// POST create gym + gym_info using staff email
exports.createGym = async (req, res) => {
  const {
    name,
    gym_type_id,
    city,
    branch_manager_email,
    address,
    contact_number,
    branch_phone,
    branch_email,
    opening_hours,
    latitude,
    longitude,
    google_maps_url,
  } = req.body;

  try {
    const staffUser = await prisma.users.findUnique({
      where: { email: branch_manager_email },
    });

    if (!staffUser) {
      return res.status(404).json({ error: 'Staff user not found' });
    }

    if (staffUser.role !== 'staff') {
      return res.status(400).json({ error: 'User is not a staff member' });
    }

    const gym = await prisma.gyms.create({
      data: {
        name,
        gym_type_id,
        city,
        branch_manager_id: staffUser.user_id,
        gym_info: {
          create: {
            address,
            city,
            contact_number,
            branch_phone,
            branch_email,
            opening_hours,
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

    res.status(201).json(gym);
  } catch (error) {
    console.error('❌ Failed to create gym:', error);
    res.status(500).json({ error: 'Failed to create gym' });
  }
};


// PUT update gym and gym_info
exports.updateGym = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    gym_type_id,
    city,
    branch_manager_id,
    address,
    contact_number,
    branch_phone,
    branch_email,
    opening_hours,
    latitude,
    longitude,
    google_maps_url,
  } = req.body;

  try {
    const updatedGym = await prisma.gyms.update({
      where: { gym_id: id },
      data: {
        name,
        gym_type_id,
        city,
        branch_manager_id,
        gym_info: {
          updateMany: {
            where: { gym_id: id },
            data: {
              address,
              city,
              contact_number,
              branch_phone,
              branch_email,
              opening_hours,
              latitude,
              longitude,
              google_maps_url,
            },
          },
        },
      },
      include: { gym_info: true },
    });

    res.json(updatedGym);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update gym' });
  }
};

// DELETE (soft-delete not needed if no flag exists, else use is_deleted)
exports.softDeleteGym = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.gyms.delete({
      where: { gym_id: id },
    });
    res.json({ message: 'Gym deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gym' });
  }
};
