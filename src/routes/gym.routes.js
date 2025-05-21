const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gym.controller');

router.get('/', gymController.getAllGyms);
router.get('/:id', gymController.getGymById);
router.post('/', gymController.createGym);
router.put('/:id', gymController.updateGym);
router.delete('/:id', gymController.softDeleteGym); // Soft delete

module.exports = router;
