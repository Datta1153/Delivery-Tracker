const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, admin, getAnalytics);

module.exports = router;
