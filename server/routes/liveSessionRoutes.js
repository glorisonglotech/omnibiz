const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const {
  createSession,
  getSessions,
  getSessionByLink,
  startSession,
  joinSession,
  endSession
} = require('../controllers/liveSessionController');

// Create a new session (requires auth)
router.post('/', protect, createSession);

// Get all sessions for user (requires auth)
router.get('/', protect, getSessions);

// Get session by access link (public)
router.get('/join/:accessLink', getSessionByLink);

// Join a session (public, but can use auth if available)
router.post('/:accessLink/join', optionalAuth, joinSession);

// Start a session (host only)
router.post('/:id/start', protect, startSession);

// End a session (host only)
router.post('/:id/end', protect, endSession);

module.exports = router;
