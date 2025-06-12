const express = require('express');
const router = express.Router();

// Frontdesk Staff Management Routes
router.get('/:gymId/staff', (req, res) => {
  res.send(`Get all staff for gym ${req.params.gymId} (Frontdesk)`);
});

router.get('/:gymId/staff/:id', (req, res) => {
  res.send(`Get staff by ID ${req.params.id} for gym ${req.params.gymId} (Frontdesk)`);
});

router.post('/:gymId/staff', (req, res) => {
  res.send(`Create new staff for gym ${req.params.gymId} (Frontdesk)`);
});

router.put('/:gymId/staff/:id', (req, res) => {
  res.send(`Update staff ${req.params.id} for gym ${req.params.gymId} (Frontdesk)`);
});

router.delete('/:gymId/staff/:id', (req, res) => {
  res.send(`Delete staff ${req.params.id} for gym ${req.params.gymId} (Frontdesk)`);
});

module.exports = router;