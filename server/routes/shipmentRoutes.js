const express = require('express');
const router = express.Router();
const {
    createShipment,
    getShipments,
    getShipmentByTrackingId,
    updateShipmentStatus,
    deleteShipment
} = require('../controllers/shipmentController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, admin, createShipment)
    .get(protect, getShipments);

// Public route for customers
router.get('/:trackingId', getShipmentByTrackingId);

router.put('/status', protect, updateShipmentStatus);
router.delete('/:id', protect, admin, deleteShipment);

module.exports = router;
