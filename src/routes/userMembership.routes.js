const express = require('express');
const router = express.Router();
const uc = require('../controllers/userMembership.controller');

router.post('/',   uc.createUserMembership);
router.get('/',    uc.getAllUserMemberships);
router.get('/:id', uc.getUserMembershipById);
router.put('/:id', uc.updateUserMembership);
router.delete('/:id', uc.deleteUserMembership);

// fetch all user-memberships for a specific gym
router.get('/gym/:gym_id', uc.getUsersByGym);

module.exports = router;
