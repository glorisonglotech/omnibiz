const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Appointment = require('../models/appointment');
const { customerAuth } = require('../middlewares/customerAuthMiddleware');

// Middleware to verify customer token
const verifyCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set customer info from token
    req.customer = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// @desc    Get customer's own orders (filtered by customer email or ID)
// @route   GET /api/customer/orders
// @access  Private (Customer)
router.get('/orders', verifyCustomer, async (req, res) => {
  try {
    const Customer = require('../models/customer');
    
    // Support both old tokens (id only) and new tokens (id + email)
    let customerEmail = req.customer.email;
    
    // If email not in token, fetch it from database using customer ID
    if (!customerEmail && req.customer.id) {
      const customer = await Customer.findById(req.customer.id).select('email');
      if (customer) {
        customerEmail = customer.email;
      }
    }
    
    if (!customerEmail) {
      return res.status(400).json({ 
        message: 'Customer email not found. Please log in again.',
        requiresRelogin: true
      });
    }

    // Find orders where customer.email matches
    const orders = await Order.find({ 'customer.email': customerEmail })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`✅ [CUSTOMER] Found ${orders.length} orders for ${customerEmail}`);
    
    res.json({ orders, total: orders.length });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// @desc    Get specific order by ID (only if customer owns it)
// @route   GET /api/customer/orders/:id
// @access  Private (Customer)
router.get('/orders/:id', verifyCustomer, async (req, res) => {
  try {
    const customerEmail = req.customer.email;
    const order = await Order.findOne({
      _id: req.params.id,
      'customer.email': customerEmail
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// @desc    Get customer's own appointments (filtered by customer email)
// @route   GET /api/customer/appointments
// @access  Private (Customer)
router.get('/appointments', verifyCustomer, async (req, res) => {
  try {
    const Customer = require('../models/customer');
    
    // Support both old tokens (id only) and new tokens (id + email)
    let customerEmail = req.customer.email;
    
    // If email not in token, fetch it from database using customer ID
    if (!customerEmail && req.customer.id) {
      const customer = await Customer.findById(req.customer.id).select('email');
      if (customer) {
        customerEmail = customer.email;
      }
    }
    
    if (!customerEmail) {
      return res.status(400).json({ 
        message: 'Customer email not found. Please log in again.',
        requiresRelogin: true
      });
    }

    // Find appointments where customerEmail matches
    const appointments = await Appointment.find({ customerEmail })
      .sort({ time: -1 })
      .limit(50);

    console.log(`✅ [CUSTOMER] Found ${appointments.length} appointments for ${customerEmail}`);
    
    res.json({ appointments, total: appointments.length });
  } catch (error) {
    console.error('Error fetching customer appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
});

module.exports = router;
