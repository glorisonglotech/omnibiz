const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getSpecificAnalytics,
  getRealtimeUpdates,
  getDashboardSummary,
  clearDashboardCache
} = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Get role-specific dashboard data
// @route   GET /api/dashboard
// @access  Private
router.get('/', getDashboardData);

// @desc    Get dashboard summary for quick overview
// @route   GET /api/dashboard/summary
// @access  Private
router.get('/summary', getDashboardSummary);

// @desc    Get real-time dashboard updates
// @route   GET /api/dashboard/realtime
// @access  Private
router.get('/realtime', getRealtimeUpdates);

// @desc    Get dashboard analytics for specific metric
// @route   GET /api/dashboard/analytics/:metric
// @access  Private
router.get('/analytics/:metric', getSpecificAnalytics);

// Admin-only routes
// @desc    Clear dashboard cache
// @route   POST /api/dashboard/clear-cache
// @access  Private (Admin)
router.post('/clear-cache', requireAdmin, clearDashboardCache);

module.exports = router;
