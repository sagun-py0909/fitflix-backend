const express = require('express');
const router = express.Router();

// Service Management Routes
router.get('/', (req, res) => { res.send('Admin: Get all services'); });
router.get('/:id', (req, res) => { res.send(`Admin: Get service ${req.params.id}`); });
router.post('/', (req, res) => { res.send('Admin: Create new service'); });
router.put('/:id', (req, res) => { res.send(`Admin: Update service ${req.params.id}`); });
router.delete('/:id', (req, res) => { res.send(`Admin: Delete service ${req.params.id}`); });

module.exports = router;