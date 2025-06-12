const express = require('express');
const router = express.Router();

// Frontdesk Gym Management Routes
router.get('/', (req, res) => {
  res.send('Get all gyms (Frontdesk)');
});

router.get('/:gymId', (req, res) => {
  res.send(`Get gym by ID ${req.params.gymId} (Frontdesk)`);
});

router.post('/', (req, res) => {
  res.send('Create new gym (Frontdesk)');
});

router.put('/:gymId', (req, res) => {
  res.send(`Update gym ${req.params.gymId} (Frontdesk)`);
});

router.delete('/:gymId', (req, res) => {
  res.send(`Delete gym ${req.params.gymId} (Frontdesk)`);
});

module.exports = router;