import express from 'express';
import { register, login, getProfile, createStaff } from '../controllers/authController.js';
import { body } from 'express-validator';
import protect, { authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and profile
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post(
  '/register',
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('email', 'Valid email is required').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     description: Login user and return token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
  '/login',
  [
    body('email', 'Valid email is required').isEmail(),
    body('password', 'Password is required').notEmpty(),
  ],
  login
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     description: Get logged-in user profile
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', protect, getProfile);

// Admin: create staff user
router.post(
  '/create-staff',
  protect,
  authorize('admin'),
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('email', 'Valid email is required').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  createStaff
);

export default router;
