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
      return res.status(401).json({ 
        message: 'No token provided',
        requiresLogin: true 
      });
    }

    const jwt = require('jsonwebtoken');
    const Customer = require('../models/customer');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify customer still exists in database
      const customer = await Customer.findById(decoded.id || decoded._id);
      if (!customer) {
        return res.status(401).json({ 
          message: 'Customer not found. Please log in again.',
          requiresLogin: true 
        });
      }
      
      // Set customer info with email guaranteed
      req.customer = {
        id: customer._id,
        email: customer.email,
        name: customer.name
      };
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Session expired. Please log in again.',
          requiresLogin: true,
          expired: true
        });
      }
      return res.status(401).json({ 
        message: 'Invalid token. Please log in again.',
        requiresLogin: true 
      });
    }
  } catch (error) {
    console.error('❌ Customer verification error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// @desc    Get customer's own orders (filtered by customer email or ID)
// @route   GET /api/customer/orders
// @route   GET /api/customers/orders
// @access  Private (Customer)
router.get('/orders', verifyCustomer, async (req, res) => {
  try {
    const customerEmail = req.customer.email; // Guaranteed by middleware
    
    console.log(`📦 [CUSTOMER] Fetching orders for: ${customerEmail}`);

    // Find orders where customer.email matches
    const orders = await Order.find({ 'customer.email': customerEmail })
      .populate('userId', 'businessName name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log(`✅ [CUSTOMER] Found ${orders.length} orders for ${customerEmail}`);
    
    res.json({ 
      success: true,
      orders, 
      total: orders.length,
      customer: req.customer.name
    });
  } catch (error) {
    console.error('❌ Error fetching customer orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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
// @route   GET /api/customers/appointments
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
      .populate('userId', 'name businessName email')
      .sort({ time: -1 })
      .limit(50);

    console.log(`✅ [CUSTOMER] Found ${appointments.length} appointments for ${customerEmail}`);
    
    res.json({ appointments, total: appointments.length });
  } catch (error) {
    console.error('Error fetching customer appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
});

// Alias route for bookings (same as appointments)
router.get('/bookings', verifyCustomer, async (req, res) => {
  try {
    const Customer = require('../models/customer');
    let customerEmail = req.customer.email;
    
    if (!customerEmail && req.customer.id) {
      const customer = await Customer.findById(req.customer.id).select('email');
      if (customer) customerEmail = customer.email;
    }
    
    if (!customerEmail) {
      return res.status(400).json({ 
        message: 'Customer email not found. Please log in again.',
        requiresRelogin: true
      });
    }

    const bookings = await Appointment.find({ customerEmail })
      .populate('userId', 'name businessName email')
      .populate('serviceId', 'name price duration image')
      .sort({ time: -1 })
      .limit(50);

    console.log(`✅ [CUSTOMER] Found ${bookings.length} bookings for ${customerEmail}`);
    res.json({ bookings, total: bookings.length });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
});

// @desc    Get specific booking details
// @route   GET /api/customers/bookings/:id
// @access  Private (Customer)
router.get('/bookings/:id', verifyCustomer, async (req, res) => {
  try {
    const customerEmail = req.customer.email;
    const booking = await Appointment.findOne({
      _id: req.params.id,
      customerEmail
    })
    .populate('userId', 'name businessName email phone')
    .populate('serviceId', 'name price duration image category');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or access denied' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
});

// @desc    Cancel a booking
// @route   PUT /api/customers/bookings/:id/cancel
// @access  Private (Customer)
router.put('/bookings/:id/cancel', verifyCustomer, async (req, res) => {
  try {
    const customerEmail = req.customer.email;
    const { reason } = req.body;
    
    const booking = await Appointment.findOne({
      _id: req.params.id,
      customerEmail
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or access denied' });
    }

    booking.status = 'Cancelled';
    booking.notes = `${booking.notes || ''}\nCancellation reason: ${reason || 'Customer request'}`;
    await booking.save();

    console.log(`✅ [CUSTOMER] Cancelled booking ${booking._id} for ${customerEmail}`);
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
});

module.exports = router;
