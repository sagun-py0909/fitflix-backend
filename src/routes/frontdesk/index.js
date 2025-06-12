const express = require('express');
const router = express.Router();
const { authorizeFrontdesk } = require('../../middlewares/auth.middleware');

const gymRoutes = require('./gyms.routes');
const checkinRoutes = require('./checkins.routes');
const staffRoutes = require('./staff.routes');
const userRoutes = require('./users.routes');
const membershipRoutes = require('./memberships.routes');

router.use(authorizeFrontdesk);

router.use('/', gymRoutes);
router.use('/', checkinRoutes);
router.use('/', staffRoutes);
router.use('/', userRoutes);
router.use('/', membershipRoutes);

module.exports = router;