const express = require('express');
const router = express.Router();
const gymController = require('../../controllers/admin/gymManagement.controller');

// List gyms by type
router.get('/type/:gymTypeId', gymController.getGymsByType);

// Nearby gyms search
router.get('/nearby', gymController.getGymsNearby);

// Get all gyms
router.get('/', gymController.getAllGyms);

// Get a single gym by ID
router.get('/:gymId', gymController.getGymById);

// Create a new gym
router.post('/', gymController.createGym);

// Update a gym
router.put('/:gymId', gymController.updateGym);

// Delete a gym
router.delete('/:gymId', gymController.deleteGym);

module.exports = router;
