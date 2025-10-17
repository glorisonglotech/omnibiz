const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const {
  getTickets,
  createTicket,
  getTicketById,
  addMessage,
  updateTicketStatus,
  assignTicket,
  getFAQs,
  createFAQ,
  markFAQHelpful,
  getSupportAgents
} = require('../controllers/supportController');

// Ticket routes
router.get('/tickets', protect, getTickets);
router.post('/tickets', protect, createTicket);
router.get('/tickets/:id', protect, getTicketById);
router.post('/tickets/:id/messages', protect, addMessage);
router.put('/tickets/:id/status', protect, requireAdmin, updateTicketStatus);
router.put('/tickets/:id/assign', protect, requireAdmin, assignTicket);

// FAQ routes
router.get('/faqs', getFAQs); // Public
router.post('/faqs', protect, requireAdmin, createFAQ);
router.post('/faqs/:id/helpful', markFAQHelpful); // Public

// Agent routes
router.get('/agents', getSupportAgents); // Public

module.exports = router;
