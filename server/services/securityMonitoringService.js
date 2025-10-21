const { getIO } = require('../config/socket');
const SecurityLog = require('../models/securityLog');
const User = require('../models/user');

class SecurityMonitoringService {
  constructor() {
    this.anomalyThresholds = {
      loginAttempts: { max: 5, window: 300000 }, // 5 attempts in 5 minutes
      apiCalls: { max: 100, window: 60000 }, // 100 calls per minute
      failedRequests: { max: 20, window: 300000 }, // 20 failures in 5 minutes
      dataAccess: { max: 50, window: 60000 }, // 50 data access in 1 minute
      permissionChanges: { max: 3, window: 3600000 }, // 3 permission changes per hour
      unusualHours: { start: 2, end: 6 }, // 2 AM - 6 AM (unusual hours)
      suspiciousIPs: new Set(),
      blockedIPs: new Set(),
    };

    this.activityBuffer = new Map(); // Store recent activities
    this.alerts = [];
  }

  /**
   * Log security event
   */
  async logSecurityEvent(eventData) {
    try {
      const {
        userId,
        userEmail,
        eventType,
        severity, // low, medium, high, critical
        description,
        ipAddress,
        userAgent,
        endpoint,
        method,
        statusCode,
        metadata = {}
      } = eventData;

      // Create security log
      const securityLog = new SecurityLog({
        userId,
        userEmail,
        eventType,
        severity,
        description,
        ipAddress,
        userAgent,
        endpoint,
        method,
        statusCode,
        metadata,
        timestamp: new Date()
      });

      await securityLog.save();

      // Check for anomalies
      const anomaly = await this.detectAnomaly(eventData);
      
      if (anomaly.detected) {
        await this.handleAnomaly(anomaly, securityLog);
      }

      return securityLog;
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Detect anomalous behavior
   */
  async detectAnomaly(eventData) {
    const { userId, userEmail, eventType, ipAddress, endpoint, statusCode } = eventData;
    const now = Date.now();
    const anomalies = [];

    // Check failed login attempts
    if (eventType === 'login_failed') {
      const recentFailures = await this.getRecentEvents(
        userEmail,
        'login_failed',
        this.anomalyThresholds.loginAttempts.window
      );

      if (recentFailures >= this.anomalyThresholds.loginAttempts.max) {
        anomalies.push({
          type: 'excessive_login_failures',
          severity: 'high',
          description: `${recentFailures} failed login attempts in ${this.anomalyThresholds.loginAttempts.window / 60000} minutes`,
          suggestion: 'Block user account temporarily and require password reset',
          autoFix: 'temporary_block'
        });
      }
    }

    // Check API rate limiting
    if (userId) {
      const recentApiCalls = await this.getRecentEvents(
        userId,
        'api_request',
        this.anomalyThresholds.apiCalls.window
      );

      if (recentApiCalls >= this.anomalyThresholds.apiCalls.max) {
        anomalies.push({
          type: 'api_rate_limit_exceeded',
          severity: 'medium',
          description: `${recentApiCalls} API calls in ${this.anomalyThresholds.apiCalls.window / 1000} seconds`,
          suggestion: 'Implement rate limiting for this user or IP',
          autoFix: 'rate_limit'
        });
      }
    }

    // Check failed requests
    if (statusCode >= 400) {
      const recentFailures = await this.getRecentEvents(
        userId || ipAddress,
        'failed_request',
        this.anomalyThresholds.failedRequests.window
      );

      if (recentFailures >= this.anomalyThresholds.failedRequests.max) {
        anomalies.push({
          type: 'excessive_failed_requests',
          severity: 'high',
          description: `${recentFailures} failed requests in ${this.anomalyThresholds.failedRequests.window / 60000} minutes`,
          suggestion: 'Investigate for potential attack or bot activity',
          autoFix: 'ip_block'
        });
      }
    }

    // Check unusual access hours
    const hour = new Date().getHours();
    if (hour >= this.anomalyThresholds.unusualHours.start && 
        hour < this.anomalyThresholds.unusualHours.end) {
      anomalies.push({
        type: 'unusual_access_time',
        severity: 'medium',
        description: `Access attempt at ${hour}:00 (unusual hours)`,
        suggestion: 'Verify if this is legitimate user activity',
        autoFix: 'none'
      });
    }

    // Check for suspicious endpoints
    const suspiciousEndpoints = ['/admin', '/config', '/env', '/.git', '/backup'];
    if (suspiciousEndpoints.some(se => endpoint?.includes(se))) {
      anomalies.push({
        type: 'suspicious_endpoint_access',
        severity: 'critical',
        description: `Attempt to access sensitive endpoint: ${endpoint}`,
        suggestion: 'Block IP and investigate immediately',
        autoFix: 'ip_block'
      });
    }

    // Check for SQL injection patterns
    if (endpoint && this.detectSQLInjection(endpoint)) {
      anomalies.push({
        type: 'sql_injection_attempt',
        severity: 'critical',
        description: 'Potential SQL injection pattern detected',
        suggestion: 'Block IP immediately and review security filters',
        autoFix: 'ip_block'
      });
    }

    // Check for XSS patterns
    if (endpoint && this.detectXSS(endpoint)) {
      anomalies.push({
        type: 'xss_attempt',
        severity: 'critical',
        description: 'Potential XSS pattern detected',
        suggestion: 'Block IP and sanitize all inputs',
        autoFix: 'ip_block'
      });
    }

    return {
      detected: anomalies.length > 0,
      anomalies,
      timestamp: now
    };
  }

  /**
   * Handle detected anomaly
   */
  async handleAnomaly(anomaly, securityLog) {
    try {
      // Notify admins in real-time
      await this.notifyAdmins(anomaly, securityLog);

      // Apply auto-fix if available
      for (const alert of anomaly.anomalies) {
        if (alert.autoFix && alert.autoFix !== 'none') {
          await this.applyAutoFix(alert.autoFix, securityLog);
        }
      }

      // Store alert
      this.alerts.push({
        ...anomaly,
        securityLogId: securityLog._id,
        timestamp: new Date()
      });

      // Keep only last 1000 alerts
      if (this.alerts.length > 1000) {
        this.alerts = this.alerts.slice(-1000);
      }

      // Log to console for immediate visibility
      console.log('🚨 SECURITY ALERT:', {
        type: anomaly.anomalies[0]?.type,
        severity: anomaly.anomalies[0]?.severity,
        user: securityLog.userEmail,
        ip: securityLog.ipAddress
      });

    } catch (error) {
      console.error('Error handling anomaly:', error);
    }
  }

  /**
   * Notify admins via Socket.IO
   */
  async notifyAdmins(anomaly, securityLog) {
    try {
      const io = getIO();
      
      // Find all admin users
      const admins = await User.find({ 
        role: { $in: ['admin', 'super_admin'] } 
      }).select('_id email');

      const notification = {
        type: 'security_alert',
        severity: anomaly.anomalies[0]?.severity || 'medium',
        title: this.getAlertTitle(anomaly.anomalies[0]?.type),
        message: anomaly.anomalies[0]?.description,
        suggestion: anomaly.anomalies[0]?.suggestion,
        user: securityLog.userEmail || 'Unknown',
        ipAddress: securityLog.ipAddress,
        timestamp: new Date(),
        logId: securityLog._id,
        anomalies: anomaly.anomalies
      };

      // Emit to all admins
      admins.forEach(admin => {
        io.to(`user_${admin._id}`).emit('security_alert', notification);
      });

      // Also emit to general admin room
      io.to('admins').emit('security_alert', notification);

      // Send to security dashboard
      io.to('security_dashboard').emit('new_security_event', {
        ...notification,
        securityLog
      });

      console.log(`🔔 Notified ${admins.length} admins about security alert`);

    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }

  /**
   * Apply automatic fixes
   */
  async applyAutoFix(fixType, securityLog) {
    try {
      switch (fixType) {
        case 'temporary_block':
          // Block user temporarily (e.g., 30 minutes)
          if (securityLog.userId) {
            await User.findByIdAndUpdate(securityLog.userId, {
              $set: {
                accountLocked: true,
                lockUntil: new Date(Date.now() + 30 * 60 * 1000)
              }
            });
            console.log(`🔒 Temporarily blocked user: ${securityLog.userEmail}`);
          }
          break;

        case 'ip_block':
          // Add IP to blocked list
          this.anomalyThresholds.blockedIPs.add(securityLog.ipAddress);
          console.log(`🚫 Blocked IP: ${securityLog.ipAddress}`);
          break;

        case 'rate_limit':
          // Add IP to rate-limited list
          this.anomalyThresholds.suspiciousIPs.add(securityLog.ipAddress);
          console.log(`⏱️ Rate limited IP: ${securityLog.ipAddress}`);
          break;

        default:
          console.log(`⚠️ Unknown auto-fix type: ${fixType}`);
      }

      // Log the auto-fix action
      await this.logSecurityEvent({
        userId: null,
        userEmail: 'system',
        eventType: 'auto_fix_applied',
        severity: 'medium',
        description: `Applied auto-fix: ${fixType}`,
        ipAddress: securityLog.ipAddress,
        metadata: { originalLogId: securityLog._id, fixType }
      });

    } catch (error) {
      console.error('Error applying auto-fix:', error);
    }
  }

  /**
   * Get recent events count
   */
  async getRecentEvents(identifier, eventType, timeWindow) {
    try {
      const since = new Date(Date.now() - timeWindow);
      
      const query = {
        eventType,
        timestamp: { $gte: since }
      };

      // Check if identifier is userId or email or IP
      if (identifier) {
        query.$or = [
          { userId: identifier },
          { userEmail: identifier },
          { ipAddress: identifier }
        ];
      }

      const count = await SecurityLog.countDocuments(query);
      return count;
    } catch (error) {
      console.error('Error getting recent events:', error);
      return 0;
    }
  }

  /**
   * Detect SQL injection patterns
   */
  detectSQLInjection(input) {
    if (!input) return false;
    
    const sqlPatterns = [
      /(\bunion\b.*\bselect\b)/i,
      /(\bselect\b.*\bfrom\b)/i,
      /(\binsert\b.*\binto\b)/i,
      /(\bdelete\b.*\bfrom\b)/i,
      /(\bdrop\b.*\btable\b)/i,
      /(\bor\b.*=.*)/i,
      /(';--|--)/i,
      /(\bexec\b|\bexecute\b)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect XSS patterns
   */
  detectXSS(input) {
    if (!input) return false;
    
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Get alert title based on type
   */
  getAlertTitle(type) {
    const titles = {
      excessive_login_failures: '🔐 Excessive Login Failures',
      api_rate_limit_exceeded: '⚡ API Rate Limit Exceeded',
      excessive_failed_requests: '❌ High Failed Request Rate',
      unusual_access_time: '🌙 Unusual Access Time',
      suspicious_endpoint_access: '🚨 Suspicious Endpoint Access',
      sql_injection_attempt: '💉 SQL Injection Attempt',
      xss_attempt: '🔓 XSS Attack Attempt',
      permission_escalation: '👑 Permission Escalation Attempt',
      data_breach_attempt: '🕵️ Potential Data Breach'
    };

    return titles[type] || '⚠️ Security Alert';
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(timeRange = 24 * 60 * 60 * 1000) {
    try {
      const since = new Date(Date.now() - timeRange);

      const stats = await SecurityLog.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);

      const recentAlerts = this.alerts.filter(
        alert => alert.timestamp > since
      );

      return {
        totalEvents: await SecurityLog.countDocuments({ timestamp: { $gte: since } }),
        bySeverity: stats.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
        recentAlerts: recentAlerts.length,
        blockedIPs: this.anomalyThresholds.blockedIPs.size,
        suspiciousIPs: this.anomalyThresholds.suspiciousIPs.size
      };
    } catch (error) {
      console.error('Error getting security stats:', error);
      return null;
    }
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ipAddress) {
    return this.anomalyThresholds.blockedIPs.has(ipAddress);
  }

  /**
   * Check if IP is rate limited
   */
  isIPRateLimited(ipAddress) {
    return this.anomalyThresholds.suspiciousIPs.has(ipAddress);
  }

  /**
   * Unblock IP
   */
  unblockIP(ipAddress) {
    this.anomalyThresholds.blockedIPs.delete(ipAddress);
    this.anomalyThresholds.suspiciousIPs.delete(ipAddress);
    console.log(`✅ Unblocked IP: ${ipAddress}`);
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit = 50) {
    return this.alerts.slice(-limit).reverse();
  }
}

// Export singleton instance
module.exports = new SecurityMonitoringService();
