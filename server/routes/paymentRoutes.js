const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  initiateMpesaPayment,
  mpesaCallback,
  checkMpesaPaymentStatus,
  createPayPalOrder,
  capturePayPalOrder
} = require('../controllers/paymentController');

// M-Pesa Routes
router.post('/mpesa/initiate', protect, initiateMpesaPayment);
router.post('/mpesa/callback', mpesaCallback); // No auth needed for callback
router.get('/mpesa/status/:transactionId', protect, checkMpesaPaymentStatus);

// PayPal Routes
router.post('/paypal/create-order', protect, createPayPalOrder);
router.post('/paypal/capture-order', protect, capturePayPalOrder);

module.exports = router;
