const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/admin/analytics.controller');

// Get total number of users
router.get('/total-users', analyticsController.getTotalUsers);

// Get total revenue
router.get('/total-revenue', analyticsController.getTotalRevenue);

// Get total check-ins
router.get('/total-checkins', analyticsController.getTotalCheckIns);

module.exports = router;