const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const { protect } = require('../middlewares/authMiddleware');

// @desc    Get all feedback (for admins)
// @route   GET /api/feedback
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('respondedBy', 'name email');
    
    res.json({ feedback, total: feedback.length });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
});

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private/Public
router.post('/', async (req, res) => {
  try {
    const { type, category, subject, message, name, email, phone, priority, contactMethod } = req.body;
    
    // Validation
    if (!subject || !message || !email) {
      return res.status(400).json({ message: 'Subject, message, and email are required' });
    }

    const feedbackData = {
      type: type || 'feedback',
      category: category || 'general',
      subject,
      message,
      name,
      email,
      phone,
      priority: priority || 'normal',
      contactMethod: contactMethod || 'email',
      status: 'pending'
    };

    // Add userId if authenticated
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        feedbackData.userId = decoded.id;
      } catch (err) {
        // Not authenticated, continue without userId
      }
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      req.app.get('io').emit('feedback_created', { feedback });
    }

    res.status(201).json({ feedback, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
});

// @desc    Get feedback by ID
// @route   GET /api/feedback/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('respondedBy', 'name email');
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
});

// @desc    Update feedback status
// @route   PUT /api/feedback/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, response, notes } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (status) feedback.status = status;
    if (notes) feedback.notes = notes;
    
    await feedback.save();

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('feedback_updated', { feedback });
    }

    res.json({ feedback, message: 'Feedback updated successfully' });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Failed to update feedback', error: error.message });
  }
});

// @desc    Add response to feedback
// @route   POST /api/feedback/:id/response
// @access  Private
router.post('/:id/response', protect, async (req, res) => {
  try {
    const { response, status } = req.body;
    
    if (!response) {
      return res.status(400).json({ message: 'Response is required' });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.response = response;
    feedback.respondedBy = req.user.id;
    feedback.respondedAt = new Date();
    if (status) feedback.status = status;
    
    await feedback.save();

    // TODO: Send email notification to the client
    // await sendFeedbackResponseEmail(feedback);

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('feedback_updated', { feedback });
    }

    res.json({ feedback, message: 'Response sent successfully' });
  } catch (error) {
    console.error('Error sending response:', error);
    res.status(500).json({ message: 'Failed to send response', error: error.message });
  }
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await feedback.deleteOne();

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Failed to delete feedback', error: error.message });
  }
});

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private
router.get('/admin/stats', protect, async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ statusStats: stats, typeStats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

module.exports = router;
