const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  requireAdmin,
  requireOrderApproval,
  requireOrderVerification,
  requireServiceManagement,
  requireViewAllOrders,
  addPermissions
} = require('../middlewares/roleMiddleware');

const {
  getAllOrders,
  approveOrder,
  verifyOrder,
  assignOrder,
  getAllServiceRequests,
  respondToServiceRequest,
  updateServiceRequestStatus,
  getDashboardStats
} = require('../controllers/adminController');

// Apply authentication and permission middleware to all routes
router.use(protect);
router.use(requireAdmin);
router.use(addPermissions);

// Order Management Routes
router.get('/orders', requireViewAllOrders, getAllOrders);
router.put('/orders/:id/approve', requireOrderApproval, approveOrder);
router.put('/orders/:id/verify', requireOrderVerification, verifyOrder);
router.put('/orders/:id/assign', assignOrder);

// Service Request Management Routes
router.get('/service-requests', requireServiceManagement, getAllServiceRequests);
router.put('/service-requests/:id/respond', requireServiceManagement, respondToServiceRequest);
router.put('/service-requests/:id/status', requireServiceManagement, updateServiceRequestStatus);

// Dashboard and Analytics
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
