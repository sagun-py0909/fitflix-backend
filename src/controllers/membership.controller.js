const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await prisma.memberships.findMany({
      include: {
        branches: true,
      },
    });
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve memberships' });
  }
};

exports.getMembershipById = async (req, res) => {
  const { id } = req.params;
  try {
    const membership = await prisma.memberships.findUnique({
      where: { membership_id: id },
      include: {
        branches: true,
      },
    });
    if (!membership) return res.status(404).json({ error: 'Membership not found' });
    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch membership' });
  }
};

exports.createMembership = async (req, res) => {
  const { gym_id, name, description, duration_days, price_rupees } = req.body;
  try {
    const newMembership = await prisma.memberships.create({
      data: {
        gym_id,
        name,
        description,
        duration_days,
        price_rupees,
      },
    });
    res.status(201).json(newMembership);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create membership' });
  }
};

exports.updateMembership = async (req, res) => {
  const { id } = req.params;
  const { gym_id, name, description, duration_days, price_rupees } = req.body;
  try {
    const updated = await prisma.memberships.update({
      where: { membership_id: id },
      data: { gym_id, name, description, duration_days, price_rupees },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update membership' });
  }
};

exports.deleteMembership = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.memberships.delete({
      where: { membership_id: id },
    });
    res.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete membership' });
  }
};
