const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { verifyCustomer } = require('../middlewares/customerAuthMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  migrateGuestWishlist
} = require('../controllers/wishlistController');

// Middleware to handle both user and customer authentication (optional)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const customerToken = req.headers['x-customer-token'];

  if (token) {
    // Try business user authentication
    return protect(req, res, next);
  } else if (customerToken) {
    // Try customer authentication
    return verifyCustomer(req, res, next);
  } else {
    // No authentication - allow for guest users
    next();
  }
};

// All routes support optional authentication (user, customer, or guest)
router.get('/', optionalAuth, getWishlist);
router.post('/', optionalAuth, addToWishlist);
router.delete('/:productId', optionalAuth, removeFromWishlist);
router.delete('/', optionalAuth, clearWishlist);

// Migration route (requires authentication)
router.post('/migrate', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const customerToken = req.headers['x-customer-token'];

  if (token) {
    return protect(req, res, next);
  } else if (customerToken) {
    return verifyCustomer(req, res, next);
  } else {
    return res.status(401).json({ message: 'Authentication required for migration' });
  }
}, migrateGuestWishlist);

module.exports = router;

