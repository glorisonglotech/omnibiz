const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateUserRole,
  assignAdminToClient,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const {
  requireAdmin,
  requireSuperAdmin,
  requireUserManagement
} = require('../middlewares/roleMiddleware');


router.post('/register', registerUser);


router.post('/login', loginUser);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getProfile);

// Admin routes
router.put('/users/:id/role', protect, requireAdmin, requireUserManagement, updateUserRole);
router.put('/clients/:id/assign-admin', protect, requireSuperAdmin, assignAdminToClient);

module.exports = router;
