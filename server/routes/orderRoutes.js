const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getUserOrders, placeOrder } = require('../controllers/orderController');
const router = express.Router();










router.get('/', protect, getUserOrders);
router.post('/', protect, placeOrder);









module.exports = router; 