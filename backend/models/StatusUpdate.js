import mongoose from 'mongoose';

const statusUpdateSchema = new mongoose.Schema(
  {
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    coords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    proofUrl: {
      type: String, // link to uploaded proof of delivery file
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('StatusUpdate', statusUpdateSchema);
