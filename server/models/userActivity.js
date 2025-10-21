const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Index created in compound index below
  },
  
  // Activity Details
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication
      'login', 'logout', 'password_change', 'profile_update',
      
      // Orders
      'order_created', 'order_updated', 'order_cancelled', 'order_approved', 
      'order_rejected', 'order_verified', 'order_completed',
      
      // Service Requests
      'service_request_created', 'service_request_updated', 'service_request_responded',
      'service_request_completed', 'service_request_cancelled',
      
      // Financial
      'transaction_created', 'payment_made', 'payment_received', 'invoice_generated',
      
      // Admin Actions
      'user_created', 'user_updated', 'user_deleted', 'role_changed', 'permissions_updated',
      'client_assigned', 'admin_assigned',
      
      // System
      'dashboard_viewed', 'report_generated', 'export_created', 'settings_updated',
      'file_uploaded', 'file_downloaded',
      
      // Communication
      'message_sent', 'notification_sent', 'email_sent',
      
      // Other
      'data_exported', 'backup_created', 'system_maintenance'
    ]
  },
  
  // Activity Category
  category: {
    type: String,
    required: true,
    enum: ['authentication', 'orders', 'services', 'financial', 'admin', 'system', 'communication'],
    index: true
  },
  
  // Activity Description
  description: {
    type: String,
    required: true
  },
  
  // Related Entity Information
  entityType: {
    type: String,
    enum: ['order', 'service_request', 'user', 'transaction', 'report', 'file', 'setting']
  },
  
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  
  // Additional Context Data
  metadata: {
    // IP Address and Location
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    
    // Device Information
    device: {
      type: String,
      browser: String,
      os: String,
      isMobile: Boolean
    },
    
    // Activity Specific Data
    oldValues: mongoose.Schema.Types.Mixed, // For update operations
    newValues: mongoose.Schema.Types.Mixed, // For update operations
    additionalData: mongoose.Schema.Types.Mixed, // Any other relevant data
    
    // Performance Metrics
    duration: Number, // Time taken for the action (in milliseconds)
    success: { type: Boolean, default: true },
    errorMessage: String
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Session Information
  sessionId: String,
  
  // Risk Assessment
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  
  // Tags for easier filtering
  tags: [String]
  
}, {
  timestamps: true,
  // TTL index to automatically delete old activities after 2 years
  expireAfterSeconds: 2 * 365 * 24 * 60 * 60 // 2 years
});

// Indexes for better query performance
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ category: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ entityType: 1, entityId: 1 });
userActivitySchema.index({ riskLevel: 1, timestamp: -1 });
userActivitySchema.index({ 'metadata.success': 1, timestamp: -1 });

// Static methods for common queries
userActivitySchema.statics.getUserActivities = function(userId, options = {}) {
  const {
    category,
    action,
    startDate,
    endDate,
    limit = 50,
    skip = 0,
    sort = { timestamp: -1 }
  } = options;
  
  const query = { userId };
  
  if (category) query.category = category;
  if (action) query.action = action;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('userId', 'name email role')
    .populate('entityId');
};

userActivitySchema.statics.getActivityStats = function(userId, timeframe = '30d') {
  const startDate = new Date();
  
  switch (timeframe) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          category: '$category',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          }
        },
        count: { $sum: 1 },
        successCount: {
          $sum: {
            $cond: [{ $eq: ['$metadata.success', true] }, 1, 0]
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        totalActivities: { $sum: '$count' },
        successfulActivities: { $sum: '$successCount' },
        dailyBreakdown: {
          $push: {
            date: '$_id.date',
            count: '$count',
            successCount: '$successCount'
          }
        }
      }
    }
  ]);
};

// Instance methods
userActivitySchema.methods.isHighRisk = function() {
  return this.riskLevel === 'high' || this.riskLevel === 'critical';
};

userActivitySchema.methods.getRelatedActivities = function(limit = 10) {
  const query = {
    userId: this.userId,
    timestamp: {
      $gte: new Date(this.timestamp.getTime() - 60 * 60 * 1000), // 1 hour before
      $lte: new Date(this.timestamp.getTime() + 60 * 60 * 1000)  // 1 hour after
    },
    _id: { $ne: this._id }
  };
  
  return this.constructor.find(query)
    .sort({ timestamp: 1 })
    .limit(limit);
};

module.exports = mongoose.model('UserActivity', userActivitySchema);
