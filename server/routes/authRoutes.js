const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getStaff, deleteStaff, registerCustomer, verifyOTP } = require('../controllers/authController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/login', loginUser);
router.post('/register', protect, admin, registerUser);
router.get('/staff', protect, admin, getStaff);
router.delete('/staff/:id', protect, admin, deleteStaff);

// Public Customer Routes
router.post('/customer/register', registerCustomer);
router.post('/customer/verify-otp', verifyOTP);

module.exports = router;
