const PurchaseOrder = require('../models/purchaseOrder');
const Supplier = require('../models/supplier');
const { getIO } = require('../config/socket');

// @desc    Get all purchase orders for authenticated user
// @route   GET /api/purchasing/orders
// @access  Private
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 50 } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const orders = await PurchaseOrder.find(filter)
      .populate('supplier', 'name contact email')
      .populate('approvedBy', 'name email')
      .populate('receivedBy', 'name email')
      .sort({ orderDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PurchaseOrder.countDocuments(filter);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single purchase order by ID
// @route   GET /api/purchasing/orders/:id
// @access  Private
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('supplier', 'name contact email address')
      .populate('approvedBy', 'name email')
      .populate('receivedBy', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new purchase order
// @route   POST /api/purchasing/orders
// @access  Private
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, items, expectedDelivery, notes, priority } = req.body;

    // Validate required fields
    if (!supplier || !items || items.length === 0 || !expectedDelivery) {
      return res.status(400).json({ 
        error: 'Missing required fields: supplier, items, and expectedDelivery are required' 
      });
    }

    // Get supplier details
    const supplierDoc = await Supplier.findOne({
      _id: supplier,
      userId: req.user._id
    });

    if (!supplierDoc) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Calculate totals
    const processedItems = items.map(item => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice
    }));

    const totalAmount = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Generate order number
    const orderCount = await PurchaseOrder.countDocuments({ userId: req.user._id });
    const orderNumber = `PO-${String(orderCount + 1).padStart(6, '0')}`;

    // Create purchase order
    const purchaseOrder = new PurchaseOrder({
      userId: req.user._id,
      orderNumber,
      supplier: supplierDoc._id,
      supplierName: supplierDoc.name,
      items: processedItems,
      totalAmount,
      expectedDelivery,
      notes,
      priority: priority || 'medium',
      status: 'pending'
    });

    await purchaseOrder.save();

    // Update supplier stats
    supplierDoc.totalOrders += 1;
    supplierDoc.lastOrderDate = new Date();
    await supplierDoc.save();

    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.to(`user_${req.user._id}`).emit('purchase_order_created', {
        purchaseOrder,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
    }

    res.status(201).json({
      message: 'Purchase order created successfully',
      purchaseOrder
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update purchase order
// @route   PUT /api/purchasing/orders/:id
// @access  Private
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier', 'name contact email');

    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Emit Socket.IO event
    try {
      const io = getIO();
      io.to(`user_${req.user._id}`).emit('purchase_order_updated', {
        purchaseOrder: order,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
    }

    res.status(200).json({
      message: 'Purchase order updated successfully',
      purchaseOrder: order
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Approve purchase order
// @route   PUT /api/purchasing/orders/:id/approve
// @access  Private
exports.approvePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be approved' });
    }

    order.status = 'approved';
    order.approvedBy = req.user._id;
    order.approvedAt = new Date();
    await order.save();

    res.status(200).json({
      message: 'Purchase order approved successfully',
      purchaseOrder: order
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete purchase order
// @route   DELETE /api/purchasing/orders/:id
// @access  Private
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.status(200).json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ SUPPLIER MANAGEMENT ============

// @desc    Get all suppliers
// @route   GET /api/purchasing/suppliers
// @access  Private
exports.getAllSuppliers = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const suppliers = await Supplier.find(filter).sort({ name: 1 });

    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new supplier
// @route   POST /api/purchasing/suppliers
// @access  Private
exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier({
      ...req.body,
      userId: req.user._id
    });

    await supplier.save();

    res.status(201).json({
      message: 'Supplier created successfully',
      supplier
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update supplier
// @route   PUT /api/purchasing/suppliers/:id
// @access  Private
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json({
      message: 'Supplier updated successfully',
      supplier
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/purchasing/suppliers/:id
// @access  Private
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

