// controllers/services.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /services
async function listServices(req, res) {
  try {
    const items = await prisma.services.findMany({
      where: { is_deleted: false }
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
}

// GET /services/:id
async function getService(req, res) {
  const { id } = req.params;
  try {
    const item = await prisma.services.findFirst({
      where: { service_id: id, is_deleted: false }
    });
    if (!item) return res.status(404).json({ error: 'Service not found.' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch service.' });
  }
}

// POST /services
async function createService(req, res) {
  const { gym_id, name, description, price_rupees } = req.body;
  if (!gym_id || !name || price_rupees == null) {
    return res.status(400).json({ error: 'gym_id, name and price_rupees are required.' });
  }
  try {
    const created = await prisma.services.create({
      data: { gym_id, name, description: description || null, price_rupees }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create service.', details: err.message });
  }
}

// PUT /services/:id
async function updateService(req, res) {
  const { id } = req.params;
  const { name, description, price_rupees } = req.body;
  try {
    const updated = await prisma.services.updateMany({
      where: { service_id: id, is_deleted: false },
      data: { name, description, price_rupees }
    });
    if (updated.count === 0) return res.status(404).json({ error: 'Service not found.' });
    const item = await prisma.services.findUnique({ where: { service_id: id } });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update service.', details: err.message });
  }
}

// DELETE /services/:id (soft delete)
async function deleteService(req, res) {
  const { id } = req.params;
  try {
    const updated = await prisma.services.updateMany({
      where: { service_id: id, is_deleted: false },
      data: { is_deleted: true }
    });
    if (updated.count === 0) return res.status(404).json({ error: 'Service not found.' });
    res.json({ message: 'Service deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
}

module.exports = {
  listServices,
  getService,
  createService,
  updateService,
  deleteService
};
