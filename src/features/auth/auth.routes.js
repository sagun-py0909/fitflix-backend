// src/features/auth/auth.routes.js
// This file defines the API routes for authentication.
// It imports the auth.controller and applies necessary middlewares.

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller'); // Import the new auth controller

// Public routes for authentication
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

module.exports = router;
