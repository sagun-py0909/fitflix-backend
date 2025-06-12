const express = require('express');
const router = express.Router();
const gymTypeController = require('../../controllers/admin/gymTypeManagement.controller');

// Create a new gym type
router.post('/', gymTypeController.createGymType);

// Get all gym types
router.get('/', gymTypeController.getAllGymTypes);

// Get a single gym type by ID
router.get('/:typeId', gymTypeController.getGymTypeById);

// Update a gym type
router.put('/:typeId', gymTypeController.updateGymType);

// Delete a gym type
router.delete('/:typeId', gymTypeController.deleteGymType);

module.exports = router;