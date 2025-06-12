const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            where: { is_deleted: false },
            include: { user_profiles: true } // Include profile data
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.users.findUnique({
            where: { user_id: id, is_deleted: false },
            include: { user_profiles: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createUser = async (req, res) => {
    const { email, password_hash, first_name, last_name, phone, role, profile } = req.body;
    try {
        const newUser = await prisma.users.create({
            data: {
                email,
                password_hash,
                first_name,
                last_name,
                phone,
                role: role || 'member', // Default role to 'member'
                user_profiles: profile ? { create: profile } : undefined
            },
            include: { user_profiles: true }
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password_hash, first_name, last_name, phone, role, profile } = req.body;
    try {
        const updatedUser = await prisma.users.update({
            where: { user_id: id, is_deleted: false },
            data: {
                email,
                password_hash,
                first_name,
                last_name,
                phone,
                role,
                updated_at: new Date(),
                user_profiles: profile ? { update: profile } : undefined
            },
            include: { user_profiles: true }
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Soft delete the user
        await prisma.users.update({
            where: { user_id: id },
            data: { is_deleted: true }
        });
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};