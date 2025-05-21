const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membership.controller');

router.get('/', membershipController.getAllMemberships);
router.get('/:id', membershipController.getMembershipById);
router.post('/', membershipController.createMembership);
router.put('/:id', membershipController.updateMembership);
router.delete('/:id', membershipController.deleteMembership);

module.exports = router;
