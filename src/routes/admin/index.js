const express = require('express');
const router = express.Router();

const usersRoutes = require('./users.routes');
const gymsRoutes = require('./gyms.routes');
const membershipsRoutes = require('./memberships.routes');
const paymentsRoutes = require('./payments.routes');
const eventsRoutes = require('./events.routes');
const servicesRoutes = require('./services.routes');
const staffRoutes = require('./staff.routes');
const analyticsRoutes = require('./analytics.routes');
const dashboardRoutes = require('./dashboard.routes');
const gymTypesRoutes = require('./gymTypes.routes');
const amenitiesRoutes = require('./amenities.routes');
const leadsRoutes = require('./leads.routes');
router.use('/leads', leadsRoutes);
router.use('/users', usersRoutes);
router.use('/gym-types', gymTypesRoutes);
router.use('/gyms', gymsRoutes);
router.use('/memberships', membershipsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/events', eventsRoutes);
router.use('/services', servicesRoutes);
router.use('/amenities', amenitiesRoutes);
router.use('/staff', staffRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;