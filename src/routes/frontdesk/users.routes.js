const express = require('express');
const router = express.Router();

// Frontdesk User Management Routes
router.post('/:gymId/users', (req, res) => {
  res.send(`Create new user for gym ${req.params.gymId} (Frontdesk)`);
});

router.get('/:gymId/users/:id', (req, res) => {
  res.send(`Get user by ID ${req.params.id} for gym ${req.params.gymId} (Frontdesk)`);
});

router.put('/:gymId/users/:id', (req, res) => {
  res.send(`Update user ${req.params.id} for gym ${req.params.gymId} (Frontdesk)`);
});

module.exports = router;