const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');
const { getAllOrders, getAnalytics, getAllUsers, exportOrdersToCSV } = require('../controllers/adminController');
const router = express.Router();








router.get('/orders', protect, isAdmin, getAllOrders);
router.get('/analytics', protect, isAdmin, getAnalytics);
router.get('/users', protect, isAdmin, getAllUsers);
router.get('/orders/export', protect, isAdmin, exportOrdersToCSV);







module.exports = router; 