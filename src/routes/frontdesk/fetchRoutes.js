// fitflix-backend/src/routes/gyms/fetchRoutes.js
const express = require('express');
const gymController = require('../../controllers/gymController');

const router = express.Router();

// Route to fetch all gym categories and their details
router.get('/gyms', gymController.getGymCategories);

module.exports = router;