// File: src/routes/user/auth.routes.js
const express = require('express');
const router = express.Router();
const { registerUser, getUserProfile } = require('../../controllers/userAuthController');

// Dummy auth middleware (replace with JWT logic later)
const mockAuth = (req, res, next) => {
  // Simulate authenticated user (replace with JWT auth later)
  req.user = { id: 'your-user-id-here' }; // TEMP: Replace this with actual ID for testing
  next();
};

router.post('/register', registerUser);
router.get('/profile', mockAuth, getUserProfile);

module.exports = router;
