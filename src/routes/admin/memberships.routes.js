// routes/admin/membershipManagement.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/admin/membershipManagement.controller.js');

// Create a new membership for a specific gym
// POST /api/admin/gyms/:gymId/memberships
router.post('/:gymId/memberships', ctrl.createMembership);

// List all active, non‑deleted memberships for a gym
// GET /api/admin/gyms/:gymId/memberships
router.get('/:gymId', ctrl.getMembershipsByGym);

// Get a single membership by its ID
// GET /api/admin/gyms/:gymId/memberships/:membershipId
router.get('/:gymId/memberships/:membershipId', ctrl.getMembership);

// Update a membership type
// PUT /api/admin/gyms/:gymId/memberships/:membershipId
router.put('/:gymId/memberships/:membershipId', ctrl.updateMembership);

// Soft‑delete (cancel) a membership type
// DELETE /api/admin/gyms/:gymId/memberships/:membershipId
router.delete('/:gymId/memberships/:membershipId', ctrl.deleteMembership);

module.exports = router;
