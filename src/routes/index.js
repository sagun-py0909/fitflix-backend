const express = require('express');
const router = express.Router();

const adminRoutes = require('./admin');
const frontdeskRoutes = require('./frontdesk');
const authRoutes = require('./auth.routes');
const userProfileRoutes = require('./user/profile.routes');

router.use('/admin', adminRoutes);
router.use('/frontdesk', frontdeskRoutes);
router.use('/auth', authRoutes);
// router.use('/user/profile', userProfileRoutes);
// router.use('/user', userRoutes);

module.exports = router;