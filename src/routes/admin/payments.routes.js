const express = require('express');
const router = express.Router();

// Payment Management Routes
router.get('/', (req, res) => { res.send('Admin: Get all payments'); });
router.get('/:id', (req, res) => { res.send(`Admin: Get payment ${req.params.id}`); });
router.put('/:id', (req, res) => { res.send(`Admin: Update payment ${req.params.id}`); });

module.exports = router;