const express = require('express');
const router = express.Router();

// Frontdesk Membership Assignment Routes
router.post('/:gymId/memberships/assign', (req, res) => {
  res.send(`Assign membership to user for gym ${req.params.gymId} (Frontdesk)`);
});

router.get('/:gymId/memberships/:userId', (req, res) => {
  res.send(`Get memberships for user ${req.params.userId} at gym ${req.params.gymId} (Frontdesk)`);
});

module.exports = router;