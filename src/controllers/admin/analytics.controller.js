//analytics.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get total number of users
const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await prisma.users.count();
        res.status(200).json({ totalUsers });
    } catch (error) {
        console.error('Error fetching total users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get total revenue (example - sum of payments)
const getTotalRevenue = async (req, res) => {
    try {
        const totalRevenue = await prisma.payments.aggregate({
            _sum: {
                amount: true,
            },
        });
        res.status(200).json({ totalRevenue: totalRevenue._sum.amount || 0 });
    } catch (error) {
        console.error('Error fetching total revenue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get total check-ins (example - count of events with type 'check-in')
const getTotalCheckIns = async (req, res) => {
    try {
        const totalCheckIns = await prisma.events.count({
            where: {
                event_type: 'check-in', // Assuming an event_type field for check-ins
            },
        });
        res.status(200).json({ totalCheckIns });
    } catch (error) {
        console.error('Error fetching total check-ins:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getTotalUsers,
    getTotalRevenue,
    getTotalCheckIns,
};