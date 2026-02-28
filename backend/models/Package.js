import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: [true, 'Tracking number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: [true, 'Sender name is required'],
    },
    senderAddress: {
      type: String,
      required: [true, 'Sender address is required'],
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
    },
    recipientAddress: {
      type: String,
      required: [true, 'Recipient address is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    weight: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
      default: 'pending',
    },
    estimatedDelivery: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    currentLocation: {
      type: String,
    },
    coords: {
      // last known GPS coordinates
      lat: { type: Number },
      lng: { type: Number },
    },
    eta: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Package', packageSchema);
