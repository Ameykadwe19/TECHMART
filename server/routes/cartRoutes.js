const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');
const { getUserCart, addItemToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const router = express.Router();





router.get('/', protect, getUserCart);
router.post('/', protect, addItemToCart);
router.put('/:productId', protect, updateCartItem);
router.delete('/:productId', protect, removeCartItem);





module.exports = router; 











