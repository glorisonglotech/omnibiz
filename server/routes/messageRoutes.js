const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { protectCustomer } = require('../middlewares/customerAuthMiddleware');
const {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  markAsRead,
  getCustomers
} = require('../controllers/messageController');

// Combined auth middleware - tries user auth first, then customer auth
const protectBoth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const jwt = require('jsonwebtoken');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'customer') {
      // Use customer authentication
      return protectCustomer(req, res, next);
    } else {
      // Use regular user authentication
      return protect(req, res, next);
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Conversation routes (support both user and customer auth)
router.get('/conversations', protectBoth, getConversations);
router.post('/conversations', protectBoth, createConversation);
router.get('/conversations/:conversationId', protectBoth, getMessages);

// Customer routes (business owner only)
router.get('/customers', protect, getCustomers);

// Message routes (support both user and customer auth)
router.post('/send', protectBoth, sendMessage);
router.post('/:messageId/read', protectBoth, markAsRead);

module.exports = router;
