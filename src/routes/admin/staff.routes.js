const express = require('express');
const router = express.Router();
const staffController = require('../../controllers/admin/staffManagement.controller');

// Create new staff + user
router.post('/', staffController.createStaff);

// Get all staff (with user/profile data)
router.get('/', staffController.getAllStaff);

// Get one staff
router.get('/:staffId', staffController.getStaffById);

// Update staff + user
router.put('/:staffId', staffController.updateStaff);

// Soft‑delete staff + user
router.delete('/:staffId', staffController.deleteStaff);

module.exports = router;
