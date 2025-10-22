const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { requireRole, addPermissions } = require('../middlewares/roleMiddleware');

const {
  createOrder,
  getMyOrders,
  getOrderDetails,
  updateOrder,
  submitOrder,
  cancelOrder,
  deleteOrder,
  createServiceRequest,
  getMyServiceRequests,
  respondToServiceProposal,
  rateService,
  getDashboardStats
} = require('../controllers/clientController');

// Apply authentication and ensure user is a client or admin
router.use(protect);
router.use(requireRole(['client', 'admin', 'super_admin']));
router.use(addPermissions);

// Order Management Routes
router.post('/orders', createOrder);
router.get('/orders', getMyOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id', updateOrder);
router.put('/orders/:id/submit', submitOrder);
router.put('/orders/:id/cancel', cancelOrder);
router.delete('/orders/:id', deleteOrder);

// Service Request Routes
router.post('/service-requests', createServiceRequest);
router.get('/service-requests', getMyServiceRequests);
router.put('/service-requests/:id/respond', respondToServiceProposal);
router.put('/service-requests/:id/rate', rateService);

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
