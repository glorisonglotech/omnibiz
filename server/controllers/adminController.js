const Order = require('../models/order');
const ServiceRequest = require('../models/serviceRequest');
const User = require('../models/user');
const { getUserPermissions, hasPermission } = require('../middlewares/roleMiddleware');
const { notificationHelpers } = require('../config/socket');
const { emailService } = require('../config/email');

// @desc    Get all orders for admin review
// @route   GET /api/admin/orders
// @access  Private (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, priority, orderType, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (orderType) filter.orderType = orderType;

    // If user is not super_admin, only show orders assigned to them or unassigned
    if (req.user.role !== 'super_admin') {
      filter.$or = [
        { assignedAdmin: req.user._id },
        { assignedAdmin: { $exists: false } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email businessName')
      .populate('assignedAdmin', 'name email')
      .populate('approvedBy', 'name email')
      .populate('verifiedBy', 'name email')
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

// @desc    Approve or reject an order
// @route   PUT /api/admin/orders/:id/approve
// @access  Private (Admin with approval permission)
exports.approveOrder = async (req, res) => {
  try {
    const { approved, rejectionReason } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (approved) {
      order.status = 'Approved';
      order.approvedBy = req.user._id;
      order.approvedAt = new Date();
      order.rejectionReason = undefined;
    } else {
      order.status = 'Rejected';
      order.rejectionReason = rejectionReason || 'No reason provided';
    }

    await order.save();

    // Send real-time notification
    notificationHelpers.notifyOrderUpdate(order.userId, {
      orderId: order._id,
      orderNumber: order.orderId,
      status: order.status,
      message: `Order ${approved ? 'approved' : 'rejected'}`,
      approved,
      rejectionReason: order.rejectionReason
    });

    // Send email notification to client
    const client = await User.findById(order.userId);
    if (client) {
      const templateName = approved ? 'orderApproved' : 'orderRejected';
      emailService.sendTemplateEmail(templateName, client.email, {
        primary: order,
        user: client
      });
    }

    res.status(200).json({
      message: `Order ${approved ? 'approved' : 'rejected'} successfully`,
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// @desc    Verify an order
// @route   PUT /api/admin/orders/:id/verify
// @access  Private (Admin with verification permission)
exports.verifyOrder = async (req, res) => {
  try {
    const { verificationNotes } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.verifiedBy = req.user._id;
    order.verifiedAt = new Date();
    order.verificationNotes = verificationNotes;
    
    // Move to processing if approved
    if (order.status === 'Approved') {
      order.status = 'Processing';
    }

    await order.save();

    // Send real-time notification
    notificationHelpers.notifyOrderUpdate(order.userId, {
      orderId: order._id,
      orderNumber: order.orderId,
      status: order.status,
      message: 'Order verified and moved to processing',
      verifiedBy: req.user.name,
      verificationNotes
    });

    res.status(200).json({
      message: 'Order verified successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify order', error: error.message });
  }
};

// @desc    Assign order to admin
// @route   PUT /api/admin/orders/:id/assign
// @access  Private (Admin)
exports.assignOrder = async (req, res) => {
  try {
    const { adminId } = req.body;
    const orderId = req.params.id;

    // Verify the admin exists and has appropriate role
    const admin = await User.findById(adminId);
    if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
      return res.status(400).json({ message: 'Invalid admin user' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.assignedAdmin = adminId;
    order.assignedAt = new Date();
    await order.save();

    res.status(200).json({
      message: 'Order assigned successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign order', error: error.message });
  }
};

// @desc    Get all service requests for admin
// @route   GET /api/admin/service-requests
// @access  Private (Admin only)
exports.getAllServiceRequests = async (req, res) => {
  try {
    const { status, serviceType, priority, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (priority) filter.priority = priority;

    // If user is not super_admin, only show requests assigned to them or unassigned
    if (req.user.role !== 'super_admin') {
      filter.$or = [
        { assignedAdminId: req.user._id },
        { assignedAdminId: { $exists: false } }
      ];
    }

    const requests = await ServiceRequest.find(filter)
      .populate('clientId', 'name email businessName')
      .populate('assignedAdminId', 'name email')
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

// @desc    Respond to service request
// @route   PUT /api/admin/service-requests/:id/respond
// @access  Private (Admin with service management permission)
exports.respondToServiceRequest = async (req, res) => {
  try {
    const { estimatedCost, estimatedTimeline, proposedSolution, terms } = req.body;
    const requestId = req.params.id;

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    serviceRequest.adminResponse = {
      estimatedCost,
      estimatedTimeline,
      proposedSolution,
      terms,
      responseDate: new Date()
    };
    serviceRequest.status = 'under_review';
    serviceRequest.assignedAdminId = req.user._id;

    await serviceRequest.save();

    // Send real-time notification
    notificationHelpers.notifyServiceRequestUpdate(
      serviceRequest.clientId,
      serviceRequest.assignedAdminId,
      {
        requestId: serviceRequest._id,
        requestNumber: serviceRequest.requestId,
        status: serviceRequest.status,
        message: 'Admin has responded to your service request',
        adminResponse: serviceRequest.adminResponse
      }
    );

    // Send email notification to client
    const client = await User.findById(serviceRequest.clientId);
    if (client) {
      emailService.sendTemplateEmail('serviceRequestResponse', client.email, {
        primary: serviceRequest,
        user: client
      });
    }

    res.status(200).json({
      message: 'Response sent successfully',
      serviceRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to respond to service request', error: error.message });
  }
};

// @desc    Update service request status
// @route   PUT /api/admin/service-requests/:id/status
// @access  Private (Admin)
exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const { status, internalNote } = req.body;
    const requestId = req.params.id;

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    serviceRequest.status = status;
    
    if (internalNote) {
      serviceRequest.internalNotes.push({
        note: internalNote,
        addedBy: req.user._id
      });
    }

    if (status === 'completed') {
      serviceRequest.actualCompletionDate = new Date();
    }

    await serviceRequest.save();

    res.status(200).json({
      message: 'Service request status updated successfully',
      serviceRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update service request', error: error.message });
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const adminFilter = req.user.role === 'super_admin' ? {} : { assignedAdmin: req.user._id };
    const serviceFilter = req.user.role === 'super_admin' ? {} : { assignedAdminId: req.user._id };

    const [
      totalOrders,
      pendingOrders,
      approvedOrders,
      totalServiceRequests,
      pendingServiceRequests,
      completedServiceRequests,
      totalClients
    ] = await Promise.all([
      Order.countDocuments(adminFilter),
      Order.countDocuments({ ...adminFilter, status: { $in: ['Submitted', 'Under_Review'] } }),
      Order.countDocuments({ ...adminFilter, status: 'Approved' }),
      ServiceRequest.countDocuments(serviceFilter),
      ServiceRequest.countDocuments({ ...serviceFilter, status: { $in: ['submitted', 'under_review'] } }),
      ServiceRequest.countDocuments({ ...serviceFilter, status: 'completed' }),
      User.countDocuments({ role: 'client' })
    ]);

    res.status(200).json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        approved: approvedOrders
      },
      serviceRequests: {
        total: totalServiceRequests,
        pending: pendingServiceRequests,
        completed: completedServiceRequests
      },
      clients: {
        total: totalClients
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};
