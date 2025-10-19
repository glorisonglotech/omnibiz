const jwt = require('jsonwebtoken');
const Customer = require('../models/customer');

// Middleware to protect customer routes
exports.protectCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Customer auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Customer auth middleware - No valid authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Customer auth middleware - No token in authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Customer auth middleware - Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify this is a customer token
    if (decoded.type !== 'customer') {
      console.log('Customer auth middleware - Invalid token type');
      return res.status(401).json({ message: 'Invalid token type' });
    }

    console.log('Customer auth middleware - Token verified for customer ID:', decoded.id);

    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      console.log('Customer auth middleware - Customer not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Customer not found' });
    }

    // Check if account is active
    if (!customer.isActive) {
      console.log('Customer auth middleware - Customer account is inactive');
      return res.status(403).json({ message: 'Account is not active' });
    }

    req.customer = customer;
    console.log('Customer auth middleware - Customer authenticated:', customer.email);
    next();
  } catch (error) {
    console.error('Customer auth middleware error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else {
      return res.status(500).json({ message: 'Authentication error' });
    }
  }
};

// Optional middleware - doesn't fail if no token, just adds customer to req if valid
exports.optionalCustomerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'customer') {
      const customer = await Customer.findById(decoded.id).select('-password');
      if (customer && customer.isActive) {
        req.customer = customer;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without customer
    next();
  }
};
