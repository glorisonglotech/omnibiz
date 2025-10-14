const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// GET /api/user/profile - Get user profile
router.get('/profile', protect, userController.getProfile);

// PUT /api/user/profile - Update user profile
router.put('/profile', protect, userController.updateProfile);

// PUT /api/user/change-password : Change password
router.put('/change-password', protect, userController.changePassword);

// PUT /api/user/settings - Update user settings
router.put('/settings', protect, userController.updateSettings);

// PUT /api/user/last-login - Update last login
router.put('/last-login', protect, userController.updateLastLogin);


// New routes for invite code
router.post('/invite-code', protect, userController.saveInviteCode);
router.get('/store-owner/:inviteCode', userController.getStoreOwnerByInviteCode);

module.exports = router;
