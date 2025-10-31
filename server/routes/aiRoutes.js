const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const {
  chat,
  generateInsights,
  analyzeSentiment,
  generateMarketing,
  generateSupportResponse,
  chatStream,
  getStatus
} = require('../controllers/aiController');

// AI service status (public)
router.get('/status', getStatus);

// AI chat routes - Allow both authenticated and guest users
router.post('/chat', optionalAuth, chat);
router.get('/chat-stream', optionalAuth, chatStream);

// Business insights
router.get('/insights', protect, generateInsights);

// Sentiment analysis
router.post('/sentiment', protect, analyzeSentiment);

// Marketing generation
router.post('/marketing', protect, generateMarketing);

// Support response (admin only)
router.post('/support-response', protect, requireAdmin, generateSupportResponse);

module.exports = router;
