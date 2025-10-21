const securityMonitoring = require('../services/securityMonitoringService');

/**
 * Middleware to log all API requests for security monitoring
 */
const securityLogger = async (req, res, next) => {
  const startTime = Date.now();

  // Get user information
  const userId = req.user?._id;
  const userEmail = req.user?.email;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  
  // Check if IP is blocked
  if (securityMonitoring.isIPBlocked(ipAddress)) {
    return res.status(403).json({
      message: 'Access denied. Your IP has been blocked due to suspicious activity.',
      contact: 'ominbizsolutions@gmail.com'
    });
  }

  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log the request asynchronously (don't wait for it)
    setImmediate(() => {
      logRequest(req, res, responseTime, userId, userEmail, ipAddress, userAgent);
    });
    
    return originalJson(data);
  };

  next();
};

/**
 * Log the request details
 */
async function logRequest(req, res, responseTime, userId, userEmail, ipAddress, userAgent) {
  try {
    const { method, originalUrl, path } = req;
    const statusCode = res.statusCode;

    // Determine severity based on status code and method
    let severity = 'low';
    let eventType = 'api_request';

    if (statusCode >= 500) {
      severity = 'high';
      eventType = 'failed_request';
    } else if (statusCode >= 400) {
      severity = 'medium';
      eventType = 'failed_request';
    } else if (method === 'DELETE') {
      severity = 'medium';
      eventType = 'data_deletion';
    } else if (method === 'PUT' || method === 'PATCH') {
      severity = 'low';
      eventType = 'data_modification';
    }

    // Special cases
    if (path.includes('/login')) {
      eventType = statusCode === 200 ? 'login_success' : 'login_failed';
      severity = eventType === 'login_failed' ? 'medium' : 'low';
    } else if (path.includes('/logout')) {
      eventType = 'logout';
    } else if (path.includes('/password')) {
      eventType = 'password_change';
      severity = 'medium';
    }

    // Log to security monitoring
    await securityMonitoring.logSecurityEvent({
      userId,
      userEmail,
      eventType,
      severity,
      description: `${method} ${originalUrl} - ${statusCode}`,
      ipAddress,
      userAgent,
      endpoint: path,
      method,
      statusCode,
      metadata: {
        responseTime,
        query: req.query,
        params: req.params
      }
    });

  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

/**
 * Middleware to check for rate limiting
 */
const rateLimiter = async (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  // Check if IP is rate limited
  if (securityMonitoring.isIPRateLimited(ipAddress)) {
    return res.status(429).json({
      message: 'Too many requests. Please try again later.',
      retryAfter: 60
    });
  }
  
  next();
};

/**
 * Middleware to validate input for SQL injection and XSS
 */
const inputSanitizer = (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  // Check query parameters
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        if (securityMonitoring.detectSQLInjection(value)) {
          logSuspiciousActivity(req, 'sql_injection_attempt', 'Query parameter');
          return res.status(400).json({ message: 'Invalid input detected' });
        }
        if (securityMonitoring.detectXSS(value)) {
          logSuspiciousActivity(req, 'xss_attempt', 'Query parameter');
          return res.status(400).json({ message: 'Invalid input detected' });
        }
      }
    }
  }

  // Check body parameters
  if (req.body) {
    const checkObject = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string') {
          if (securityMonitoring.detectSQLInjection(value)) {
            logSuspiciousActivity(req, 'sql_injection_attempt', `Body parameter: ${currentPath}`);
            return false;
          }
          if (securityMonitoring.detectXSS(value)) {
            logSuspiciousActivity(req, 'xss_attempt', `Body parameter: ${currentPath}`);
            return false;
          }
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          if (!checkObject(value, currentPath)) {
            return false;
          }
        }
      }
      return true;
    };

    if (!checkObject(req.body)) {
      return res.status(400).json({ message: 'Invalid input detected' });
    }
  }

  next();
};

/**
 * Log suspicious activity
 */
async function logSuspiciousActivity(req, type, location) {
  const userId = req.user?._id;
  const userEmail = req.user?.email;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');

  await securityMonitoring.logSecurityEvent({
    userId,
    userEmail,
    eventType: 'suspicious_activity',
    severity: 'critical',
    description: `${type} detected in ${location}: ${req.method} ${req.originalUrl}`,
    ipAddress,
    userAgent,
    endpoint: req.path,
    method: req.method,
    metadata: {
      attackType: type,
      location,
      query: req.query,
      body: req.body
    }
  });
}

module.exports = {
  securityLogger,
  rateLimiter,
  inputSanitizer
};
