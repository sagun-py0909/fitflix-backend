const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new gym type
const createGymType = async (req, res) => {
    try {
        const { name } = req.body;
        const newGymType = await prisma.gym_types.create({
            data: {
                name,
            },
        });
        res.status(201).json(newGymType);
    } catch (error) {
        console.error('Error creating gym type:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all gym types
const getAllGymTypes = async (req, res) => {
    try {
        const gymTypes = await prisma.gym_types.findMany();
        res.status(200).json(gymTypes);
    } catch (error) {
        console.error('Error fetching gym types:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a single gym type by ID
const getGymTypeById = async (req, res) => {
    try {
        const { typeId } = req.params;
        const gymType = await prisma.gym_types.findUnique({
            where: {
                gym_type_id: typeId,
            },
        });
        if (!gymType) {
            return res.status(404).json({ error: 'Gym type not found' });
        }
        res.status(200).json(gymType);
    } catch (error) {
        console.error('Error fetching gym type by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a gym type
const updateGymType = async (req, res) => {
    try {
        const { typeId } = req.params;
        const { name } = req.body;
        const updatedGymType = await prisma.gym_types.update({
            where: {
                gym_type_id: typeId,
            },
            data: {
                name,
            },
        });
        res.status(200).json(updatedGymType);
    } catch (error) {
        console.error('Error updating gym type:', error);
        res.status(400).json({ error: error.message });
    }
};

// Delete a gym type
const deleteGymType = async (req, res) => {
    try {
        const { typeId } = req.params;
        await prisma.gym_types.delete({
            where: {
                gym_type_id: typeId,
            },
        });
        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        console.error('Error deleting gym type:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createGymType,
    getAllGymTypes,
    getGymTypeById,
    updateGymType,
    deleteGymType,
};