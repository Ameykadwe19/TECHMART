const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { createPaymentIntent, handleStripeWebhook, refundPayment, processCodPayment } = require('../controllers/paymentController');
const router = express.Router();









router.post('/stripe', protect, createPaymentIntent);
router.post('/cod', protect, processCodPayment);
router.post('/refund', protect, refundPayment);
router.post('/webhook', handleStripeWebhook); // no auth here










module.exports = router; 


