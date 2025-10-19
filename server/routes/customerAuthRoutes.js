// server/routes/customerAuthRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/customerAuthController');
const { protectCustomer } = require('../middlewares/customerAuthMiddleware');

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (require customer authentication)
router.get('/profile', protectCustomer, getCustomerProfile);
router.put('/profile', protectCustomer, updateCustomerProfile);
router.put('/change-password', protectCustomer, changePassword);

module.exports = router;
