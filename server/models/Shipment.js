const mongoose = require('mongoose');

const SHIPMENT_STATUSES = [
    'Order Created',
    'Picked Up',
    'Origin Facility',
    'In Transit',
    'Destination Facility',
    'Out for Delivery',
    'Delivered'
];

const shipmentSchema = new mongoose.Schema({
    trackingId: { type: String, required: true, unique: true, index: true },
    barcode: { type: String }, // Can store base64 or URL
    senderName: { type: String, required: true },
    receiverName: { type: String, required: true },
    originAddress: { type: String, required: true },
    destinationAddress: { type: String, required: true },
    packageWeight: { type: Number, required: true },
    customerEmail: { type: String, required: true },
    status: {
        type: String,
        enum: SHIPMENT_STATUSES,
        default: 'Order Created'
    },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    proofOfDelivery: { type: String }, // URL/Path to file
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
module.exports.SHIPMENT_STATUSES = SHIPMENT_STATUSES;
