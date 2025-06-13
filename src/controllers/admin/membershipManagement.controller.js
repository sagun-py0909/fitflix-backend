// controllers/admin/membershipManagement.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create (always non-deleted, active by default)
async function createMembership(req, res) {
    const { gymId } = req.params;
    let { name, description, price_rupees, duration_days } = req.body;
  
    try {
      // Convert to numbers
      price_rupees = Number(price_rupees);
      duration_days = Number(duration_days);
  
      // Validate inputs
      if (!name || !description || isNaN(price_rupees) || isNaN(duration_days)) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
  
      const m = await prisma.memberships.create({
        data: {
          name,
          description,
          price_rupees,
          duration_days,
          gym_id: gymId,
          status: 'active',
          is_deleted: false
        }
      });
  
      res.status(201).json(m);
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: e.message });
    }
  }
  

// List all for a gym (non-deleted, active)
async function getMembershipsByGym(req, res) {
  const { gymId } = req.params;
  try {
    const list = await prisma.memberships.findMany({
      where: { gym_id: gymId, is_deleted: false, status: 'active' }
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get one by membership_id
async function getMembership(req, res) {
  const { gymId, membershipId } = req.params;
  try {
    const m = await prisma.memberships.findUnique({
      where: { membership_id: membershipId, gym_id: gymId }
    });
    if (!m || m.is_deleted) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(m);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update
async function updateMembership(req, res) {
  const { gymId, membershipId } = req.params;
  const { name, description, price_rupees, duration_days, status } = req.body;
  try {
    const m = await prisma.memberships.update({
      where: { membership_id: membershipId, gym_id: gymId },
      data: { name, description, price_rupees, duration_days, status }
    });
    res.json(m);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
}

// Soft‑delete
async function deleteMembership(req, res) {
  const { gymId, membershipId } = req.params;
  try {
    await prisma.memberships.update({
      where: { membership_id: membershipId, gym_id: gymId },
      data: { is_deleted: true, status: 'cancelled' }
    });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
}

module.exports = {
  createMembership,
  getMembershipsByGym,
  getMembership,
  updateMembership,
  deleteMembership
};
