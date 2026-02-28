import express from 'express';
import Package from '../models/Package.js';
import StatusUpdate from '../models/StatusUpdate.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tracking
 *   description: Public tracking lookup
 */

// public endpoint for customers to track by number
/**
 * @swagger
 * /track/{trackingNumber}:
 *   get:
 *     tags:
 *       - Tracking
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package and status updates
 */
router.get('/:trackingNumber', async (req, res) => {
  try {
    const tn = req.params.trackingNumber.toUpperCase();
    const pkg = await Package.findOne({ trackingNumber: tn });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    const statusUpdates = await StatusUpdate.find({ package: pkg._id }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, package: pkg, statusUpdates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
