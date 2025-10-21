const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Customer = require('../models/customer');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - No valid authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Auth middleware - No token in authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Auth middleware - Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token verified for user ID:', decoded.id);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('Auth middleware - User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    console.log('Auth middleware - User authenticated:', user.email);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    console.error('Auth middleware stack:', error.stack);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else {
      return res.status(500).json({ message: 'Authentication error' });
    }
  }
};

// Optional authentication - allows request through whether authenticated or not
// Supports both admin users and customers
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth provided, continue without user
      req.user = null;
      req.customer = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      req.customer = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try to find admin user first
      let user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        req.user = user;
        req.customer = null;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ optionalAuth: Admin user authenticated:', user.email);
        }
      } else {
        // Try to find customer
        const customer = await Customer.findById(decoded.id).select('-password');
        
        if (customer) {
          req.customer = customer;
          req.user = {
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            role: 'customer',
            businessName: 'Customer'
          };
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ optionalAuth: Customer authenticated:', customer.email);
          }
        } else {
          req.user = null;
          req.customer = null;
        }
      }
    } catch (error) {
      // Token invalid, continue without user
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ optionalAuth: Invalid token, continuing as guest');
      }
      req.user = null;
      req.customer = null;
    }
    
    next();
  } catch (error) {
    // Any error, continue without user
    console.error('optionalAuth error:', error);
    req.user = null;
    req.customer = null;
    next();
  }
};
