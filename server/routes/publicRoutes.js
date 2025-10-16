const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Appointment = require('../models/appointment');
const User = require('../models/user');
const { notificationHelpers } = require('../config/socket');
const { emailService } = require('../config/email');

// Helper: find store owner by inviteCode
async function findOwnerByInviteCode(inviteCode) {
  if (!inviteCode) return null;
  const owner = await User.findOne({ inviteCode }).select('_id name email assignedAdmin role');
  return owner || null;
}

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
    const { inviteCode, customerName, service, time, durationMinutes, notes, email } = req.body;
    const owner = await findOwnerByInviteCode(inviteCode);
    if (!owner) {
      return res.status(400).json({ message: 'Invalid or missing inviteCode' });
    }

    const appointment = new Appointment({
      userId: owner._id,
      customerName,
      service,
      time,
      durationMinutes,
      status: 'Pending',
      notes
    });

    await appointment.save();

    // Notify admins/owner via sockets
    notificationHelpers.notifyAdmins({
      title: 'New Appointment Request',
      message: `${customerName} requested ${service} at ${new Date(time).toLocaleString()}`
    });

    // Email confirmations (best-effort)
    if (email) {
      emailService.sendEmail(email, 'Appointment Received', `<p>Hi ${customerName}, your appointment request for ${service} has been received.</p>`);
    }
    emailService.sendEmail(owner.email, 'New Appointment Request', `<p>${customerName} requested ${service}.</p>`);

    return res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    console.error('Public appointment error:', error);
    return res.status(400).json({ message: error.message || 'Failed to create appointment' });
  }
});

module.exports = router;


