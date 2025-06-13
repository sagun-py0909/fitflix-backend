const express = require('express');
const router = express.Router();

const adminRoutes = require('./admin');
const frontdeskRoutes = require('./frontdesk');
const userRoutes = require('./user/user.routes');
const userAuthRoutes = require('./user/userAuth.routes');

router.use('/admin', adminRoutes);
router.use('/frontdesk', frontdeskRoutes);
router.use('/user', userRoutes);
router.use('/userAuth', userAuthRoutes);

module.exports = router;