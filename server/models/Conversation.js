const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  businessOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  businessOwnerName: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: String,
  customerPhone: String,
  lastMessage: {
    content: String,
    senderId: mongoose.Schema.Types.ObjectId,
    timestamp: Date
  },
  unreadCount: {
    businessOwner: { type: Number, default: 0 },
    customer: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  tags: [String],
  notes: String,
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Compound index for finding conversations between specific users
conversationSchema.index({ businessOwnerId: 1, customerId: 1 }, { unique: true });
conversationSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
