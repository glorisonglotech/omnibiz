const UserActivity = require('../models/userActivity');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

class ActivityLogger {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    
    // Start the batch processor
    this.startBatchProcessor();
  }

  /**
   * Log user activity
   * @param {Object} activityData - Activity data to log
   * @param {Object} req - Express request object (optional)
   */
  async logActivity(activityData, req = null) {
    try {
      const enrichedData = this.enrichActivityData(activityData, req);
      
      // Add to queue for batch processing
      this.queue.push(enrichedData);
      
      // If queue is full, process immediately
      if (this.queue.length >= this.batchSize) {
        await this.processBatch();
      }
      
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }

  /**
   * Enrich activity data with request information
   */
  enrichActivityData(activityData, req) {
    const enriched = { ...activityData };
    
    if (req) {
      // Extract IP and location
      const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const geo = geoip.lookup(ip);
      
      // Parse user agent
      const parser = new UAParser(req.headers['user-agent']);
      const uaResult = parser.getResult();
      
      enriched.metadata = {
        ...enriched.metadata,
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
        location: geo ? {
          country: geo.country,
          city: geo.city,
          coordinates: {
            lat: geo.ll[0],
            lng: geo.ll[1]
          }
        } : null,
        device: {
          type: uaResult.device.type || 'desktop',
          browser: `${uaResult.browser.name} ${uaResult.browser.version}`,
          os: `${uaResult.os.name} ${uaResult.os.version}`,
          isMobile: uaResult.device.type === 'mobile'
        },
        sessionId: req.sessionID || req.headers['x-session-id']
      };
    }
    
    // Set default values
    enriched.timestamp = enriched.timestamp || new Date();
    enriched.metadata = enriched.metadata || {};
    enriched.metadata.success = enriched.metadata.success !== false;
    
    return enriched;
  }

  /**
   * Process queued activities in batch
   */
  async processBatch() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await UserActivity.insertMany(batch, { ordered: false });
      console.log(`✅ Logged ${batch.length} activities`);
    } catch (error) {
      console.error('❌ Error saving activity batch:', error);
      // Re-queue failed items (optional)
      // this.queue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start the batch processor interval
   */
  startBatchProcessor() {
    setInterval(async () => {
      await this.processBatch();
    }, this.flushInterval);
  }

  /**
   * Flush all queued activities immediately
   */
  async flush() {
    while (this.queue.length > 0) {
      await this.processBatch();
    }
  }

  // Convenience methods for common activities
  async logLogin(userId, req, success = true, errorMessage = null) {
    return this.logActivity({
      userId,
      action: 'login',
      category: 'authentication',
      description: success ? 'User logged in successfully' : 'Failed login attempt',
      metadata: {
        success,
        errorMessage
      }
    }, req);
  }

  async logLogout(userId, req) {
    return this.logActivity({
      userId,
      action: 'logout',
      category: 'authentication',
      description: 'User logged out'
    }, req);
  }

  async logOrderCreated(userId, orderId, orderData, req) {
    return this.logActivity({
      userId,
      action: 'order_created',
      category: 'orders',
      description: `Order ${orderData.orderId} created`,
      entityType: 'order',
      entityId: orderId,
      metadata: {
        orderValue: orderData.total,
        orderType: orderData.orderType,
        priority: orderData.priority
      }
    }, req);
  }

  async logOrderStatusChange(userId, orderId, oldStatus, newStatus, req) {
    return this.logActivity({
      userId,
      action: 'order_updated',
      category: 'orders',
      description: `Order status changed from ${oldStatus} to ${newStatus}`,
      entityType: 'order',
      entityId: orderId,
      metadata: {
        oldValues: { status: oldStatus },
        newValues: { status: newStatus }
      }
    }, req);
  }

  async logServiceRequestCreated(userId, requestId, requestData, req) {
    return this.logActivity({
      userId,
      action: 'service_request_created',
      category: 'services',
      description: `Service request ${requestData.requestId} created`,
      entityType: 'service_request',
      entityId: requestId,
      metadata: {
        serviceType: requestData.serviceType,
        priority: requestData.priority
      }
    }, req);
  }

  async logTransaction(userId, transactionId, transactionData, req) {
    return this.logActivity({
      userId,
      action: 'transaction_created',
      category: 'financial',
      description: `${transactionData.type} transaction: ${transactionData.description}`,
      entityType: 'transaction',
      entityId: transactionId,
      metadata: {
        amount: transactionData.amount,
        type: transactionData.type,
        category: transactionData.category
      }
    }, req);
  }

  async logAdminAction(adminId, action, targetUserId, description, req) {
    return this.logActivity({
      userId: adminId,
      action,
      category: 'admin',
      description,
      entityType: 'user',
      entityId: targetUserId,
      riskLevel: 'medium'
    }, req);
  }

  async logDashboardView(userId, dashboardType, req) {
    return this.logActivity({
      userId,
      action: 'dashboard_viewed',
      category: 'system',
      description: `Viewed ${dashboardType} dashboard`,
      metadata: {
        dashboardType
      }
    }, req);
  }

  async logReportGeneration(userId, reportType, reportData, req) {
    return this.logActivity({
      userId,
      action: 'report_generated',
      category: 'system',
      description: `Generated ${reportType} report`,
      metadata: {
        reportType,
        dateRange: reportData.dateRange,
        filters: reportData.filters
      }
    }, req);
  }

  async logFileUpload(userId, fileName, fileSize, req) {
    return this.logActivity({
      userId,
      action: 'file_uploaded',
      category: 'system',
      description: `Uploaded file: ${fileName}`,
      metadata: {
        fileName,
        fileSize,
        fileType: fileName.split('.').pop()
      }
    }, req);
  }

  async logSecurityEvent(userId, eventType, description, riskLevel = 'high', req) {
    return this.logActivity({
      userId,
      action: eventType,
      category: 'authentication',
      description,
      riskLevel,
      tags: ['security', 'alert']
    }, req);
  }
}

// Create singleton instance
const activityLogger = new ActivityLogger();

// Middleware to automatically log certain activities
const activityMiddleware = (action, category, getDescription) => {
  return (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log activity after successful response
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const description = typeof getDescription === 'function' 
          ? getDescription(req, data) 
          : getDescription;
          
        activityLogger.logActivity({
          userId: req.user._id,
          action,
          category,
          description,
          metadata: {
            statusCode: res.statusCode,
            method: req.method,
            path: req.path
          }
        }, req);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  activityLogger,
  activityMiddleware
};
