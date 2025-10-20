const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['feedback', 'complaint', 'suggestion', 'question'],
    required: true,
    default: 'feedback'
  },
  category: {
    type: String,
    default: 'general'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: String,
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  contactMethod: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  response: String,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: Date,
  attachments: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ userId: 1, status: 1 });
feedbackSchema.index({ email: 1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
