const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Appointment = require('../models/appointment');
const User = require('../models/user');
const Product = require('../models/product');
const Service = require('../models/service');
const { notificationHelpers, getIO } = require('../config/socket');
const { emailService } = require('../config/email');
const { notificationService } = require('../services/notificationService');
const { getStorefrontDiscounts } = require('../controllers/discountController');

// Helper: find store owner by inviteCode
async function findOwnerByInviteCode(inviteCode) {
  if (!inviteCode) return null;
  const owner = await User.findOne({ inviteCode }).select('_id name email assignedAdmin role');
  return owner || null;
}

// GET /api/public/store-owner/:inviteCode - Get store owner information
router.get('/store-owner/:inviteCode', async (req, res) => {
  try {
    const { inviteCode } = req.params;
    
    const owner = await User.findOne({ inviteCode }).select('name email businessName businessEmail businessPhone businessAddress');
    
    if (!owner) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json({
      name: owner.name,
      businessName: owner.businessName || owner.name,
      businessEmail: owner.businessEmail || owner.email,
      businessPhone: owner.businessPhone,
      businessAddress: owner.businessAddress
    });
  } catch (error) {
    console.error('Store owner fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch store information' });
  }
});

// GET /api/public/services - Get services/appointments available
router.get('/services', async (req, res) => {
  try {
    const { inviteCode } = req.query;
    
    if (inviteCode) {
      const owner = await findOwnerByInviteCode(inviteCode);
      if (!owner) {
        return res.status(400).json({ message: 'Invalid inviteCode' });
      }
      
      // Get services from Service model (real-time synced data)
      const services = await Service.find({ 
        userId: owner._id, 
        isActive: true 
      })
        .populate('availableTeamMembers', 'name role')
        .populate('locations', 'name city address')
        .select('name description price duration category bookings rating image')
        .sort({ createdAt: -1 })
        .limit(50);
      
      return res.json(services);
    }
    
    res.json([]);
  } catch (error) {
    console.error('Services fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// GET /api/public/products - Get public products for storefront
router.get('/products', async (req, res) => {
  try {
    const { inviteCode } = req.query;
    
    // ALWAYS require inviteCode for security
    if (!inviteCode) {
      return res.status(400).json({ message: 'inviteCode is required' });
    }
    
    // Get products for the specific store owner only
    const owner = await findOwnerByInviteCode(inviteCode);
    if (!owner) {
      return res.status(400).json({ message: 'Invalid inviteCode or store not found' });
    }
    
    const products = await Product.find({ userId: owner._id })
      .select('name description price category stockQuantity stock image rating isActive')
      .sort({ createdAt: -1 });
    
    console.log(`✅ [PUBLIC] Loaded ${products.length} products for store: ${owner.email}`);
    res.json(products);
  } catch (error) {
    console.error('Public products error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch products' });
  }
});

// POST /api/public/orders - Guest order creation (storefront)
router.post('/orders', async (req, res) => {
  try {
    const { inviteCode, customer, items, deliveryInfo, orderType = 'standard', priority = 'medium', subtotal = 0, taxAmount = 0, shippingCost = 0, attachments = [] } = req.body;

    const owner = await findOwnerByInviteCode(inviteCode);
    if (!owner) {
      return res.status(400).json({ message: 'Invalid or missing inviteCode' });
    }

    const orderCount = await Order.countDocuments();
    const orderId = `ORD${String(orderCount + 1).padStart(6, '0')}`;
    const total = Number(subtotal) + Number(taxAmount) + Number(shippingCost);
    const approvalRequired = total > 10000 || orderType === 'bulk' || orderType === 'custom' || priority === 'urgent';

    const order = new Order({
      userId: owner._id, // attribute order to store owner
      orderId,
      customer,
      items,
      deliveryInfo,
      orderType,
      priority,
      subtotal,
      taxAmount,
      shippingCost,
      total,
      approvalRequired,
      status: 'Submitted',
      attachments
    });

    // auto-assign to admin if owner has one
    if (owner.assignedAdmin) {
      order.assignedAdmin = owner.assignedAdmin;
      order.assignedAt = new Date();
    }

    await order.save();

    // Real-time notify admins
    notificationHelpers.notifyNewOrder({
      orderId: order._id,
      orderNumber: order.orderId,
      clientName: order.customer?.name,
      total: order.total,
      status: order.status,
      requiresApproval: approvalRequired,
      priority: order.priority,
      orderType: order.orderType
    });

    // Email confirmations (best-effort)
    if (customer?.email) {
      emailService.sendTemplateEmail('orderCreated', customer.email, { primary: order, user: { name: customer.name } });
    }
    emailService.sendTemplateEmail('newOrderNotification', owner.email, { primary: order, user: owner });

    return res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Public order error:', error);
    return res.status(400).json({ message: error.message || 'Failed to create order' });
  }
});

// POST /api/public/appointments - Guest appointment booking (storefront)
router.post('/appointments', async (req, res) => {
  try {
    const { inviteCode, customerName, customerEmail, customerPhone, service, time, durationMinutes, notes, price } = req.body;
    
    // Validate required fields
    if (!customerName || !service || !time) {
      return res.status(400).json({ message: 'Customer name, service, and time are required' });
    }

    const owner = await findOwnerByInviteCode(inviteCode);
    if (!owner) {
      return res.status(400).json({ message: 'Invalid or missing inviteCode' });
    }

    const appointment = new Appointment({
      userId: owner._id,
      customerName,
      service,
      time,
      durationMinutes: durationMinutes || 30,
      status: 'Pending',
      notes: notes || ''
    });

    await appointment.save();

    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.to(`user_${owner._id}`).emit('appointment_created', {
        appointment,
        userId: owner._id,
        timestamp: new Date()
      });
      
      // Notify all admins
      io.to('admins').emit('appointment_created', {
        appointment,
        userId: owner._id,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
    }

    // Send notifications
    try {
      // Email to customer
      if (customerEmail) {
        await notificationService.sendEmail({
          to: customerEmail,
          subject: 'Appointment Request Received - OmniBiz',
          html: `
            <h2>Appointment Request Received</h2>
            <p>Hi ${customerName},</p>
            <p>Thank you for booking an appointment with us!</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Date & Time:</strong> ${new Date(time).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${durationMinutes || 30} minutes</p>
            ${price ? `<p><strong>Price:</strong> $${price}</p>` : ''}
            <p>We will confirm your appointment shortly.</p>
            <p>Best regards,<br>${owner.businessName || owner.name}</p>
          `
        });
      }

      // SMS to customer (if phone provided and SMS enabled)
      if (customerPhone) {
        await notificationService.sendSMS({
          to: customerPhone,
          message: `Appointment request received for ${service} on ${new Date(time).toLocaleDateString()} at ${new Date(time).toLocaleTimeString()}. We'll confirm shortly. - ${owner.businessName || owner.name}`
        });
      }

      // Notify owner
      await notificationService.sendCustomNotification({
        user: owner,
        title: 'New Appointment Request',
        message: `${customerName} requested ${service} on ${new Date(time).toLocaleString()}. Duration: ${durationMinutes || 30} minutes.`,
        includeEmail: true,
        includeSMS: false
      });
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    return res.status(201).json({ 
      message: 'Appointment request submitted successfully! We will confirm shortly.',
      appointment 
    });
  } catch (error) {
    console.error('Public appointment error:', error);
    return res.status(400).json({ message: error.message || 'Failed to create appointment' });
  }
});

// GET /api/public/discounts - Get active storefront discounts
router.get('/discounts', getStorefrontDiscounts);

module.exports = router;


