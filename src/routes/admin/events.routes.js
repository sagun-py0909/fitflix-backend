const express = require('express');
const router = express.Router();

// Event Management Routes
router.get('/', (req, res) => { res.send('Admin: Get all events'); });
router.get('/:id', (req, res) => { res.send(`Admin: Get event ${req.params.id}`); });
router.post('/', (req, res) => { res.send('Admin: Create new event'); });
router.put('/:id', (req, res) => { res.send(`Admin: Update event ${req.params.id}`); });
router.delete('/:id', (req, res) => { res.send(`Admin: Delete event ${req.params.id}`); });

module.exports = router;