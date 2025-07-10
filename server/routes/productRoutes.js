const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview, searchProducts } = require('../controllers/productController');
const router = express.Router();








router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);
router.post('/:id/review', protect, addReview);










module.exports = router; 