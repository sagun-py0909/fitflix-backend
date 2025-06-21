// controllers/amenities.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /amenities
async function listAmenities(req, res) {
  try {
    const items = await prisma.amenities.findMany({
      where: { is_deleted: false }
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch amenities.' });
  }
}

// GET /amenities/:id
async function getAmenity(req, res) {
  const { id } = req.params;
  try {
    const item = await prisma.amenities.findFirst({
      where: { amenity_id: id, is_deleted: false }
    });
    if (!item) return res.status(404).json({ error: 'Amenity not found.' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch amenity.' });
  }
}

// POST /amenities
async function createAmenity(req, res) {
  const { name, icon_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });
  try {
    const created = await prisma.amenities.create({
      data: { name, icon_url: icon_url || null }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create amenity.', details: err.message });
  }
}

// PUT /amenities/:id
async function updateAmenity(req, res) {
  const { id } = req.params;
  const { name, icon_url } = req.body;
  try {
    const updated = await prisma.amenities.updateMany({
      where: { amenity_id: id, is_deleted: false },
      data: { name, icon_url }
    });
    if (updated.count === 0) return res.status(404).json({ error: 'Amenity not found.' });
    const item = await prisma.amenities.findUnique({ where: { amenity_id: id } });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update amenity.', details: err.message });
  }
}

// DELETE /amenities/:id  (soft delete)
async function deleteAmenity(req, res) {
  const { id } = req.params;
  try {
    const updated = await prisma.amenities.updateMany({
      where: { amenity_id: id, is_deleted: false },
      data: { is_deleted: true }
    });
    if (updated.count === 0) return res.status(404).json({ error: 'Amenity not found.' });
    res.json({ message: 'Amenity deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete amenity.' });
  }
}

module.exports = {
  listAmenities,
  getAmenity,
  createAmenity,
  updateAmenity,
  deleteAmenity
};
