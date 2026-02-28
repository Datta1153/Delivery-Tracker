import express from 'express';
import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackageStatus,
  deletePackage,
} from '../controllers/packageController.js';
import { body } from 'express-validator';
import protect, { authorize } from '../middleware/auth.js';
import { uploadProof } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Packages
 *   description: Package management and status updates
 */

// All package routes require authentication
router.use(protect);

// only admin or staff can create shipments
/**
 * @swagger
 * /packages:
 *   post:
 *     tags:
 *       - Packages
 *     security:
 *       - bearerAuth: []
 *     description: Create a new package shipment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackingNumber:
 *                 type: string
 *               senderName:
 *                 type: string
 *               senderAddress:
 *                 type: string
 *               recipientName:
 *                 type: string
 *               recipientAddress:
 *                 type: string
 *               description:
 *                 type: string
 *               weight:
 *                 type: string
 *               estimatedDelivery:
 *                 type: string
 *                 format: date
 *               eta:
 *                 type: string
 *                 format: date
 *               coords:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       201:
 *         description: Package created
 */
router.post(
  '/',
  [
    body('trackingNumber', 'Tracking number is required').optional().trim().notEmpty(),
    body('senderName', 'Sender name is required').trim().notEmpty(),
    body('senderAddress', 'Sender address is required').trim().notEmpty(),
    body('recipientName', 'Recipient name is required').trim().notEmpty(),
    body('recipientAddress', 'Recipient address is required').trim().notEmpty(),
  ],
  authorize('admin', 'staff'),
  createPackage
);

// users may list their own packages (customers) or staff/admin can filter globally
/**
 * @swagger
 * /packages:
 *   get:
 *     tags:
 *       - Packages
 *     security:
 *       - bearerAuth: []
 *     description: List packages with optional filters
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of packages
 */
router.get('/', getPackages);

/**
 * @swagger
 * /packages/{id}:
 *   get:
 *     tags:
 *       - Packages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package details
 */
router.get('/:id', getPackageById);

// only staff (and admin) can update status
/**
 * @swagger
 * /packages/{id}/status:
 *   put:
 *     tags:
 *       - Packages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               proof:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated status
 */
router.put('/:id/status', authorize('admin', 'staff'), uploadProof.single('proof'), updatePackageStatus);

// deleting parcel - admin only
/**
 * @swagger
 * /packages/{id}:
 *   delete:
 *     tags:
 *       - Packages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package deleted
 */
router.delete('/:id', authorize('admin'), deletePackage);

export default router;
