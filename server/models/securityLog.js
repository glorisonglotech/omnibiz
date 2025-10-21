const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userEmail: {
    type: String,
    default: null
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'login_success',
      'login_failed',
      'logout',
      'password_change',
      'password_reset',
      'api_request',
      'failed_request',
      'permission_change',
      'data_access',
      'data_modification',
      'data_deletion',
      'file_upload',
      'file_download',
      'suspicious_activity',
      'auto_fix_applied',
      'account_locked',
      'account_unlocked',
      'ip_blocked',
      'rate_limit_applied'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  endpoint: {
    type: String,
    default: null
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    default: null
  },
  statusCode: {
    type: Number,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolution: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
securityLogSchema.index({ userId: 1, timestamp: -1 });
securityLogSchema.index({ userEmail: 1, timestamp: -1 });
securityLogSchema.index({ ipAddress: 1, timestamp: -1 });
securityLogSchema.index({ eventType: 1, timestamp: -1 });
securityLogSchema.index({ severity: 1, timestamp: -1 });
securityLogSchema.index({ resolved: 1, timestamp: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
