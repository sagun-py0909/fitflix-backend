// user.routes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  getProfile,
  updateProfile,
  getGyms,
  getMemberships
} = require('../../controllers/user/user.controller.js');
const { auth } = require('../../middlewares/auth.middleware.js'); // your JWT verify middleware


// Protected (must attach `auth` to populate `req.user`)
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
// Public
router.get('/gyms', getGyms);
router.get('/memberships/:gymId', getMemberships);

module.exports = router;
