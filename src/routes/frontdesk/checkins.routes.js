const express = require('express');
const router = express.Router();

// Frontdesk Check-in Management Routes
router.post('/:gymId/checkin', (req, res) => {
  res.send(`Handle user check-in for gym ${req.wparams.gymId} (Frontdesk)`);
});

router.post('/:gymId/checkout', (req, res) => {
  res.send(`Handle user check-out for gym ${req.params.gymId} (Frontdesk)`);
});

router.get('/:gymId/history/:userId', (req, res) => {
  res.send(`Get check-in history for user ${req.params.userId} at gym ${req.params.gymId} (Frontdesk)`);
});

module.exports = router;