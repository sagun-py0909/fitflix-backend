const express = require('express');
const router = express.Router();
const userManagementController = require('../../controllers/admin/userManagement.controller');

// Basic user management routes
router.get('/', userManagementController.getAllUsers);
router.get('/:id', userManagementController.getUserById);
router.post('/', userManagementController.createUser);
router.put('/:id', userManagementController.updateUser);
router.delete('/:id', userManagementController.deleteUser);

module.exports = router;