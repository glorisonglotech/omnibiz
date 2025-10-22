const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Customer']
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['business_owner', 'customer', 'admin', 'support'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  attachments: [{
    url: String,
    type: String,
    name: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: Date
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ status: 1 });

module.exports = mongoose.model('Message', messageSchema);
