const express = require('express');
const router = express.Router();
const gymController = require('../../controllers/admin/gymManagement.controller');
const multer = require('multer');

// Multer Setup for Memory Storage (buffers)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // max 50MB per file
});

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

// Upload gym media (photos/videos)
// use multer to parse up to 10 files under field name "media"
router.post(
  '/:gymId/media',
  upload.array('media', 10),
  gymController.uploadMediaHandler
);

// List gym media (photos/videos)
router.get('/:gymId/media', gymController.listMediaHandler);

// Delete a gym media object (body: { key: 'gym_123/photos/...' })
router.delete(
  '/:gymId/media',
  express.json(),
  gymController.deleteMediaHandler
);

module.exports = router;
