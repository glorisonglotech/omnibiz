const express = require('express');
const router = express.Router();
const {
  getUserActivityHistory,
  getActivityStats,
  getActivityDetails,
  getSystemActivityOverview,
  exportActivityData
} = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Get user's activity history
// @route   GET /api/activities/history
// @access  Private
router.get('/history', getUserActivityHistory);

// @desc    Get activity statistics for current user
// @route   GET /api/activities/stats
// @access  Private
router.get('/stats', getActivityStats);

// @desc    Get activity details by ID
// @route   GET /api/activities/:id
// @access  Private
router.get('/:id', getActivityDetails);

// @desc    Export activity data
// @route   POST /api/activities/export
// @access  Private
router.post('/export', exportActivityData);

// Admin-only routes
// @desc    Get system-wide activity overview
// @route   GET /api/activities/system-overview
// @access  Private (Admin)
// router.get('/system-overview', requireAdmin, getSystemActivityOverview);

module.exports = router;
