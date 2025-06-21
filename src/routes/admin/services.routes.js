// routes/services.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/admin/service.controller');

router.get('/',   ctrl.listServices);
router.get('/:id',ctrl.getService);
router.post('/',  ctrl.createService);
router.put('/:id',ctrl.updateService);
router.delete('/:id', ctrl.deleteService);

module.exports = router;
