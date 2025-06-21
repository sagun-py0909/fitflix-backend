// routes/amenities.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/admin/amenitites.controller');

router.get('/',   ctrl.listAmenities);
router.get('/:id',ctrl.getAmenity);
router.post('/',  ctrl.createAmenity);
router.put('/:id',ctrl.updateAmenity);
router.delete('/:id', ctrl.deleteAmenity);

module.exports = router;
