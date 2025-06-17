const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all services (non-deleted), optionally filter by gym_id
async function getAllServices(req, res) {
  try {
    const { gym_id } = req.query;
    const where = { is_deleted: false };
    if (gym_id) where.gym_id = gym_id;

    const services = await prisma.services.findMany({
      where,
      include: {
        gyms: true // Include gym details if needed
      }
    });
    return res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

// Get a single service by ID
async function getServiceById(req, res) {
  try {
    const { id } = req.params;
    const service = await prisma.services.findFirst({
      where: { service_id: id, is_deleted: false },
      include: { gyms: true }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    return res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

// Create a new service
async function createService(req, res) {
  try {
    const { gym_id, name, description, price_rupees } = req.body;
    const newService = await prisma.services.create({
      data: {
        gym_id,
        name,
        description,
        price_rupees
      }
    });
    return res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(400).json({ message: 'Could not create service.', details: error.message });
  }
}

// Update an existing service
async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price_rupees, is_deleted } = req.body;
    const existing = await prisma.services.findUnique({ where: { service_id: id } });
    if (!existing) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const updatedService = await prisma.services.update({
      where: { service_id: id },
      data: {
        name,
        description,
        price_rupees,
        ...(typeof is_deleted === 'boolean' ? { is_deleted } : {})
      }
    });
    return res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(400).json({ message: 'Could not update service.', details: error.message });
  }
}

// Soft delete a service
async function deleteService(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.services.findUnique({ where: { service_id: id } });
    if (!existing) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    await prisma.services.update({
      where: { service_id: id },
      data: { is_deleted: true }
    });
    return res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
