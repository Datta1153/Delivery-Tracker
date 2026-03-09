const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema({
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    status: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('TrackingEvent', trackingEventSchema);
