const Order = require('../models/order');
const ServiceRequest = require('../models/serviceRequest');
const User = require('../models/user');
const { notificationHelpers } = require('../config/socket');
const { emailService } = require('../config/email');

// @desc    Create a new order
// @route   POST /api/client/orders
// @access  Private (Client)
exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      supplier,
      items,
      deliveryInfo,
      orderType = 'standard',
      priority = 'medium',
      clientNotes,
      subtotal,
      taxAmount = 0,
      shippingCost = 0,
      attachments = [],
      total: providedTotal,
      status,
      paymentStatus,
      paymentMethod,
      shippingMethod,
      notes,
      notificationMethod = 'email',
      date
    } = req.body;

    // Generate order ID
    const orderCount = await Order.countDocuments();
    const orderId = `ORD${String(orderCount + 1).padStart(6, '0')}`;

    // Calculate total from items if not provided
    let calculatedTotal = providedTotal;
    let calculatedFromItems = false;
    
    if (!calculatedTotal && items && items.length > 0) {
      calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      calculatedFromItems = true;
    } else if (!calculatedTotal && subtotal) {
      calculatedTotal = subtotal + taxAmount + shippingCost;
    }

    // Determine if approval is required
    const approvalRequired = calculatedTotal > 10000 || orderType === 'bulk' || orderType === 'custom' || priority === 'urgent';

    const order = new Order({
      userId: req.user._id,
      orderId,
      customer: customer || null,
      supplier: supplier || null,
      items: items || [],
      deliveryInfo,
      orderType,
      priority,
      clientNotes: clientNotes || notes,
      // If calculated from items, don't set subtotal (let it be 0) to avoid pre-save recalculation
      subtotal: calculatedFromItems ? 0 : (subtotal || 0),
      taxAmount: taxAmount || 0,
      shippingCost: shippingCost || 0,
      total: calculatedTotal || 0,
      approvalRequired,
      status: status || 'Pending',
      paymentStatus: paymentStatus || 'Unpaid',
      paymentMethod: paymentMethod || '',
      shippingMethod: shippingMethod || '',
      notes: notes || '',
      notificationMethod,
      date: date || new Date(),
      attachments: attachments || []
    });

    await order.save();

    // If client has assigned admin, assign the order
    if (req.user.assignedAdmin) {
      order.assignedAdmin = req.user.assignedAdmin;
      order.assignedAt = new Date();
      await order.save();
    }

    // Send notifications to supplier if this is a supplier order
    if (supplier && supplier.email) {
      try {
        // Send Email notification if email or both
        if (notificationMethod === 'email' || notificationMethod === 'both') {
          const emailContent = `
            <h2>New Order from ${req.user.businessName || req.user.name}</h2>
            <p>You have received a new order:</p>
            <ul>
              <li><strong>Order ID:</strong> ${order.orderId}</li>
              <li><strong>Total Amount:</strong> KES ${order.total.toFixed(2)}</li>
              <li><strong>Items:</strong> ${items.length} product(s)</li>
              <li><strong>Status:</strong> ${order.status}</li>
            </ul>
            <h3>Order Details:</h3>
            ${items.map(item => `
              <p>• ${item.name} (SKU: ${item.sku}) - Qty: ${item.quantity} @ KES ${item.price.toFixed(2)}</p>
            `).join('')}
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            <p>Please prepare this order for processing.</p>
          `;
          
          await emailService.sendEmail(
            supplier.email,
            `New Order ${order.orderId} from ${req.user.businessName || req.user.name}`,
            emailContent
          );
        }

        // Send SMS notification if sms or both
        if ((notificationMethod === 'sms' || notificationMethod === 'both') && supplier.phone) {
          const twilioClient = require('twilio')(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          
          const smsMessage = `New Order ${order.orderId} from ${req.user.businessName || req.user.name}. Total: KES ${order.total.toFixed(2)}. ${items.length} items. Status: ${order.status}.`;
          
          await twilioClient.messages.create({
            body: smsMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: supplier.phone
          });
        }
      } catch (notifError) {
        console.error('Error sending supplier notification:', notifError);
        // Don't fail the order creation if notification fails
      }
    }

    // Send real-time notification to admins about new order
    if (notificationHelpers && notificationHelpers.notifyNewOrder) {
      notificationHelpers.notifyNewOrder({
        orderId: order._id,
        orderNumber: order.orderId,
        clientName: (supplier && supplier.name) || (customer && customer.name) || req.user.name,
        total: order.total,
        status: order.status,
        requiresApproval: approvalRequired,
        priority: order.priority,
        orderType: order.orderType
      });
    }

    res.status(201).json({
      message: supplier ? 'Supplier order created successfully' : 'Order created successfully',
      order,
      requiresApproval: approvalRequired
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// @desc    Get client's orders
// @route   GET /api/client/orders
// @access  Private (Client)
exports.getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('assignedAdmin', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// @desc    Get specific order details
// @route   GET /api/client/orders/:id
// @access  Private (Client - own orders only)
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    })
    .populate('assignedAdmin', 'name email phone')
    .populate('approvedBy', 'name email')
    .populate('verifiedBy', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order details', error: error.message });
  }
};

// @desc    Update order (only if in draft status)
// @route   PUT /api/client/orders/:id
// @access  Private (Client - own orders only)
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Draft') {
      return res.status(400).json({ message: 'Order cannot be modified after submission' });
    }

    const allowedUpdates = ['items', 'deliveryInfo', 'clientNotes', 'subtotal', 'taxAmount', 'shippingCost'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Recalculate total if financial fields are updated
    if (updates.subtotal || updates.taxAmount || updates.shippingCost) {
      updates.total = (updates.subtotal || order.subtotal) + 
                     (updates.taxAmount || order.taxAmount) + 
                     (updates.shippingCost || order.shippingCost);
    }

    Object.assign(order, updates);
    await order.save();

    res.status(200).json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// @desc    Submit order for processing
// @route   PUT /api/client/orders/:id/submit
// @access  Private (Client - own orders only)
exports.submitOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Draft') {
      return res.status(400).json({ message: 'Order has already been submitted' });
    }

    order.status = order.approvalRequired ? 'Submitted' : 'Processing';
    await order.save();

    res.status(200).json({
      message: 'Order submitted successfully',
      order,
      requiresApproval: order.approvalRequired
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit order', error: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/client/orders/:id/cancel
// @access  Private (Client - own orders only)
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'Cancelled';
    order.rejectionReason = reason || 'Cancelled by client';
    await order.save();

    res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/client/orders/:id
// @access  Private (Client - own orders only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
};

// @desc    Create service request
// @route   POST /api/client/service-requests
// @access  Private (Client)
exports.createServiceRequest = async (req, res) => {
  try {
    const {
      serviceType,
      title,
      description,
      priority = 'medium',
      requirements,
      deliveryDetails,
      attachments = []
    } = req.body;

    const serviceRequest = new ServiceRequest({
      clientId: req.user._id,
      serviceType,
      title,
      description,
      priority,
      requirements,
      deliveryDetails,
      attachments: attachments || [],
      assignedAdminId: req.user.assignedAdmin
    });

    await serviceRequest.save();

    // Send real-time notification to admins about new service request
    notificationHelpers.notifyNewServiceRequest({
      requestId: serviceRequest._id,
      requestNumber: serviceRequest.requestId,
      clientName: req.user.name,
      serviceType: serviceRequest.serviceType,
      title: serviceRequest.title,
      priority: serviceRequest.priority,
      assignedAdminId: serviceRequest.assignedAdminId
    });

    // Send email confirmation to client
    emailService.sendTemplateEmail('serviceRequestCreated', req.user.email, {
      primary: serviceRequest,
      user: req.user
    });

    // Send email notification to admins
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
    for (const admin of admins) {
      emailService.sendTemplateEmail('newServiceRequestNotification', admin.email, {
        primary: serviceRequest,
        user: req.user
      });
    }

    res.status(201).json({
      message: 'Service request created successfully',
      serviceRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create service request', error: error.message });
  }
};

// @desc    Get client's service requests
// @route   GET /api/client/service-requests
// @access  Private (Client)
exports.getMyServiceRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { clientId: req.user._id };
    if (status) filter.status = status;

    const requests = await ServiceRequest.find(filter)
      .populate('assignedAdminId', 'name email phone')
      .sort({ requestedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ServiceRequest.countDocuments(filter);

    res.status(200).json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch service requests', error: error.message });
  }
};

// @desc    Respond to admin's service proposal
// @route   PUT /api/client/service-requests/:id/respond
// @access  Private (Client - own requests only)
exports.respondToServiceProposal = async (req, res) => {
  try {
    const { approved, comments, requestedChanges } = req.body;
    
    const serviceRequest = await ServiceRequest.findOne({
      _id: req.params.id,
      clientId: req.user._id
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    serviceRequest.clientFeedback = {
      approved,
      comments,
      requestedChanges,
      feedbackDate: new Date()
    };

    serviceRequest.status = approved ? 'in_progress' : 'pending_client';

    await serviceRequest.save();

    res.status(200).json({
      message: 'Response submitted successfully',
      serviceRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to respond to service proposal', error: error.message });
  }
};

// @desc    Rate completed service
// @route   PUT /api/client/service-requests/:id/rate
// @access  Private (Client - own requests only)
exports.rateService = async (req, res) => {
  try {
    const { score, review } = req.body;
    
    const serviceRequest = await ServiceRequest.findOne({
      _id: req.params.id,
      clientId: req.user._id
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    if (serviceRequest.status !== 'completed') {
      return res.status(400).json({ message: 'Service must be completed before rating' });
    }

    serviceRequest.rating = {
      score,
      review,
      ratedAt: new Date()
    };

    await serviceRequest.save();

    res.status(200).json({
      message: 'Rating submitted successfully',
      serviceRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};

// @desc    Get client dashboard statistics
// @route   GET /api/client/dashboard-stats
// @access  Private (Client)
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalServiceRequests,
      pendingServiceRequests,
      completedServiceRequests
    ] = await Promise.all([
      Order.countDocuments({ userId: req.user._id }),
      Order.countDocuments({ userId: req.user._id, status: { $in: ['Submitted', 'Under_Review', 'Processing'] } }),
      Order.countDocuments({ userId: req.user._id, status: 'Delivered' }),
      ServiceRequest.countDocuments({ clientId: req.user._id }),
      ServiceRequest.countDocuments({ clientId: req.user._id, status: { $in: ['submitted', 'under_review', 'in_progress'] } }),
      ServiceRequest.countDocuments({ clientId: req.user._id, status: 'completed' })
    ]);

    res.status(200).json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      serviceRequests: {
        total: totalServiceRequests,
        pending: pendingServiceRequests,
        completed: completedServiceRequests
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};
