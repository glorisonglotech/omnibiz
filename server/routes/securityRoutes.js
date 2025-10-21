const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const {
  getSecurityLogs,
  getSecurityStats,
  getActiveAlerts,
  resolveAlert,
  unblockIP,
  getBlockedIPs
} = require('../controllers/securityController');

// All routes require authentication and admin role
router.use(protect);
router.use(requireRole(['admin', 'super_admin']));

// Security logs and stats
router.get('/logs', getSecurityLogs);
router.get('/stats', getSecurityStats);
router.get('/alerts', getActiveAlerts);

// Actions
router.patch('/logs/:id/resolve', resolveAlert);
router.post('/unblock-ip', unblockIP);
router.get('/blocked-ips', getBlockedIPs);

module.exports = router;
