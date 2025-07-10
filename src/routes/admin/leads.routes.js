const express = require('express');
const router = express.Router();
const leadController = require('../../controllers/admin/leads.controller');

router.post('/create', leadController.createLead);
router.get('/', leadController.getLeads);

module.exports = router;
