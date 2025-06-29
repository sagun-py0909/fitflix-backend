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
  const { name, description, price_rupees , gym_id } = req.body;
  if (!name || price_rupees == null) {
    return res.status(400).json({ error: 'name and price_rupees are required.' });
  }
  try {
    const createdService = await prisma.services.create({
      data: { name, description: description || null, price_rupees }
    });

    // Add relation in gym_services
    if (gym_id){
      await prisma.gym_services.create({
      data: {
        gym_id,
        service_id: createdService.service_id
      }
    });
    }
    

    res.status(201).json(createdService);
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

// GET services offered by a specific gym
async function getServicesByGym(req, res) {
  const { gymId } = req.params;
  try {
    const gymServiceLinks = await prisma.gym_services.findMany({
      where: { gym_id: gymId },
    });
    if (gymServiceLinks.length === 0) {
      return res.status(404).json({ error: 'No services found for this gym.' });
    }

    const services = await prisma.services.findMany({
      where: {
        service_id: {
          in: gymServiceLinks.map(link => link.service_id)
        },
        is_deleted: false
      }
    });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch services for gym.' });
  }
}

module.exports = {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByGym
};
