const SecurityLog = require('../models/securityLog');
const securityMonitoring = require('../services/securityMonitoringService');

// Get security logs
exports.getSecurityLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      severity, 
      eventType, 
      resolved,
      startDate,
      endDate 
    } = req.query;

    const query = {};

    if (severity) query.severity = severity;
    if (eventType) query.eventType = eventType;
    if (resolved !== undefined) query.resolved = resolved === 'true';
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await SecurityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email')
      .populate('resolvedBy', 'name email');

    const total = await SecurityLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting security logs:', error);
    res.status(500).json({ message: 'Failed to get security logs' });
  }
};

// Get security statistics
exports.getSecurityStats = async (req, res) => {
  try {
    const { timeRange = 24 } = req.query; // hours
    const stats = await securityMonitoring.getSecurityStats(timeRange * 60 * 60 * 1000);
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting security stats:', error);
    res.status(500).json({ message: 'Failed to get security stats' });
  }
};

// Get active alerts
exports.getActiveAlerts = async (req, res) => {
  try {
    const alerts = securityMonitoring.getRecentAlerts(100);
    res.json(alerts);
  } catch (error) {
    console.error('Error getting active alerts:', error);
    res.status(500).json({ message: 'Failed to get active alerts' });
  }
};

// Resolve an alert
exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    const log = await SecurityLog.findByIdAndUpdate(
      id,
      {
        resolved: true,
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        resolution: resolution || 'Manually resolved by admin'
      },
      { new: true }
    );

    if (!log) {
      return res.status(404).json({ message: 'Security log not found' });
    }

    res.json({ message: 'Alert resolved successfully', log });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ message: 'Failed to resolve alert' });
  }
};

// Unblock an IP address
exports.unblockIP = async (req, res) => {
  try {
    const { ipAddress } = req.body;

    if (!ipAddress) {
      return res.status(400).json({ message: 'IP address is required' });
    }

    securityMonitoring.unblockIP(ipAddress);

    // Log the action
    await securityMonitoring.logSecurityEvent({
      userId: req.user._id,
      userEmail: req.user.email,
      eventType: 'account_unlocked',
      severity: 'medium',
      description: `IP address ${ipAddress} unblocked by admin`,
      ipAddress,
      metadata: { unblockedBy: req.user.email }
    });

    res.json({ message: 'IP address unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    res.status(500).json({ message: 'Failed to unblock IP' });
  }
};

// Get blocked IPs
exports.getBlockedIPs = async (req, res) => {
  try {
    const blockedIPs = Array.from(securityMonitoring.anomalyThresholds.blockedIPs);
    const suspiciousIPs = Array.from(securityMonitoring.anomalyThresholds.suspiciousIPs);

    res.json({
      blockedIPs,
      suspiciousIPs,
      totalBlocked: blockedIPs.length,
      totalSuspicious: suspiciousIPs.length
    });
  } catch (error) {
    console.error('Error getting blocked IPs:', error);
    res.status(500).json({ message: 'Failed to get blocked IPs' });
  }
};
