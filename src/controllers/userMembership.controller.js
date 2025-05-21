const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create user_membership
exports.createUserMembership = async (req, res) => {
  const { user_id, membership_id, start_date, end_date, status } = req.body;

  try {
    const [user, membership] = await Promise.all([
      prisma.users.findUnique({ where: { user_id } }),
      prisma.memberships.findUnique({ where: { membership_id } })
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!membership) return res.status(404).json({ error: 'Membership not found' });

    const userMembership = await prisma.user_memberships.create({
      data: {
        user_id,
        membership_id,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status,
      },
    });

    return res.status(201).json(userMembership);
  } catch (error) {
    console.error('Failed to create user_membership:', error);
    return res.status(500).json({ error: 'Failed to create user_membership' });
  }
};

// List all user_memberships
exports.getAllUserMemberships = async (req, res) => {
  try {
    const all = await prisma.user_memberships.findMany({
      include: {
        users: true,
        memberships: {
          include: { gyms: true },
        },
      },
    });
    res.json(all);
  } catch (error) {
    console.error('Error fetching user memberships:', error);
    res.status(500).json({ error: 'Failed to fetch user memberships' });
  }
};

// Get user_membership by ID
exports.getUserMembershipById = async (req, res) => {
  const { id } = req.params;
  try {
    const membership = await prisma.user_memberships.findUnique({
      where: { user_membership_id: id },
      include: {
        users: true,
        memberships: true,
      },
    });
    if (!membership) return res.status(404).json({ error: 'Not found' });
    res.json(membership);
  } catch (error) {
    console.error('Error fetching user_membership:', error);
    res.status(500).json({ error: 'Failed to fetch user_membership' });
  }
};

// Update user_membership
exports.updateUserMembership = async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date, status } = req.body;
  try {
    const updated = await prisma.user_memberships.update({
      where: { user_membership_id: id },
      data: {
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        status,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating user_membership:', error);
    res.status(500).json({ error: 'Failed to update user_membership' });
  }
};

// Delete user_membership
exports.deleteUserMembership = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user_memberships.delete({
      where: { user_membership_id: id },
    });
    res.json({ message: 'User membership deleted successfully' });
  } catch (error) {
    console.error('Error deleting user_membership:', error);
    res.status(500).json({ error: 'Failed to delete user_membership' });
  }
};

// Get all users with memberships for a specific gym
exports.getUsersByGym = async (req, res) => {
  const { gym_id } = req.params;
  try {
    const list = await prisma.user_memberships.findMany({
      where: {
        memberships: { gym_id },
      },
      include: {
        users: true,
        memberships: true,
      },
    });
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users for the gym' });
  }
};