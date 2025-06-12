//membershipManagement.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new membership type
const createMembershipType = async (req, res) => {
    try {
        const { name, description, price, duration_months } = req.body;
        const newMembershipType = await prisma.membership_types.create({
            data: {
                name,
                description,
                price,
                duration_months,
            },
        });
        res.status(201).json(newMembershipType);
    } catch (error) {
        console.error('Error creating membership type:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all membership types
const getAllMembershipTypes = async (req, res) => {
    try {
        const membershipTypes = await prisma.membership_types.findMany();
        res.status(200).json(membershipTypes);
    } catch (error) {
        console.error('Error fetching membership types:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a single membership type by ID
const getMembershipTypeById = async (req, res) => {
    try {
        const { typeId } = req.params;
        const membershipType = await prisma.membership_types.findUnique({
            where: {
                membership_type_id: typeId,
            },
        });
        if (!membershipType) {
            return res.status(404).json({ error: 'Membership type not found' });
        }
        res.status(200).json(membershipType);
    } catch (error) {
        console.error('Error fetching membership type by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a membership type
const updateMembershipType = async (req, res) => {
    try {
        const { typeId } = req.params;
        const { name, description, price, duration_months } = req.body;
        const updatedMembershipType = await prisma.membership_types.update({
            where: {
                membership_type_id: typeId,
            },
            data: {
                name,
                description,
                price,
                duration_months,
            },
        });
        res.status(200).json(updatedMembershipType);
    } catch (error) {
        console.error('Error updating membership type:', error);
        res.status(400).json({ error: error.message });
    }
};

// Delete a membership type
const deleteMembershipType = async (req, res) => {
    try {
        const { typeId } = req.params;
        await prisma.membership_types.delete({
            where: {
                membership_type_id: typeId,
            },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting membership type:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createMembershipType,
    getAllMembershipTypes,
    getMembershipTypeById,
    updateMembershipType,
    deleteMembershipType,
};