import express from 'express';
import { getDeliveryStats } from '../controllers/reportsController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Aggregated delivery statistics
 */

// require auth for reports
router.use(protect);

/**
 * @swagger
 * /reports/delivery-stats:
 *   get:
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     description: Get delivery counts grouped by status
 *     responses:
 *       200:
 *         description: Stats object
 */
router.get('/delivery-stats', getDeliveryStats);

export default router;
