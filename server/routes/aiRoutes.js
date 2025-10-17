const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const {
  chat,
  generateInsights,
  analyzeSentiment,
  generateMarketing,
  generateSupportResponse,
  chatStream
} = require('../controllers/aiController');

// AI chat routes
router.post('/chat', protect, chat);
router.get('/chat-stream', protect, chatStream);

// Business insights
router.get('/insights', protect, generateInsights);

// Sentiment analysis
router.post('/sentiment', protect, analyzeSentiment);

// Marketing generation
router.post('/marketing', protect, generateMarketing);

// Support response (admin only)
router.post('/support-response', protect, requireAdmin, generateSupportResponse);

module.exports = router;
