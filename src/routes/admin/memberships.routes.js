const express = require('express');
const router = express.Router();
const membershipController = require('../../controllers/admin/membershipManagement.controller');

// Create a new membership type
router.post('/', membershipController.createMembershipType);

// Get all membership types
router.get('/', membershipController.getAllMembershipTypes);

// Get a single membership type by ID
router.get('/:typeId', membershipController.getMembershipTypeById);

// Update a membership type
router.put('/:typeId', membershipController.updateMembershipType);

// Delete a membership type
router.delete('/:typeId', membershipController.deleteMembershipType);

module.exports = router;