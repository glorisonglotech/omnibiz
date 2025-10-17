const Order = require("../models/order");
const asyncHandler = require("../middlewares/asyncHandler");
const Transaction = require("../models/transaction");
const { updateStockAfterOrder } = require("./inventoryController");

// Create transaction from order
const createTransactionFromOrder = async (orderId, userId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    const transaction = new Transaction({
      userId,
      description: `Order payment from ${order.customer.name}`,
      amount: order.total,
      type: 'income',
      category: 'sales',
      status: 'completed',
      reference: orderId,
      notes: `Order payment - ${order.orderId} - ${order.customer.name}`
    });

    await transaction.save();
    console.log('Transaction created for order:', orderId);
    return transaction;
  } catch (error) {
    console.error('Error creating transaction from order:', error);
  }
};

// Create a new order
exports.createOrder = asyncHandler(async (req, res) => {
  try {
    console.log('Creating order with data:', req.body);
    console.log('User ID:', req.user?.id);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    const order = new Order({
      ...req.body,
      userId: userId,
    });

    console.log('Order object before save:', order);
    await order.save();
    console.log('Order saved successfully:', order._id);

    // If order status is Paid, create a transaction and update stock
    if (order.status === 'Paid' || order.paymentStatus === 'Paid') {
      console.log('Creating transaction for paid order:', order._id);
      await createTransactionFromOrder(order._id, userId);
      
      // Update inventory stock
      const stockUpdateResult = await updateStockAfterOrder(order._id);
      if (stockUpdateResult.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Inventory updated:', stockUpdateResult.updates?.length || 0, 'products affected');
          if (stockUpdateResult.alerts?.length > 0) {
            console.log('⚠️  Stock alerts:', stockUpdateResult.alerts.map(a => `${a.type}: ${a.product.name}`).join(', '));
          }
        }
      } else {
        console.error('❌ Stock update failed:', stockUpdateResult.error);
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);

    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Order ID already exists'
      });
    }

    res.status(400).json({ error: error.message });
  }
});

// Get all orders for the logged-in user
exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id; 
    const orders = await Order.find({ userId }) 
      .populate("userId")
      .populate("items.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single order by ID for the logged-in user
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id; 
    const order = await Order.findOne({
      _id: req.params.id,
      userId: userId 
    })
      .populate("userId")
      .populate("items.product");
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update an order for the logged-in user
exports.updateOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the old order to check status changes
    const oldOrder = await Order.findOne({ _id: req.params.id, userId: userId });
    if (!oldOrder) {
      return res.status(404).json({ error: "Order not found or not authorized to edit" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: userId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate("userId")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ error: "Order not found or not authorized to edit" });
    }

    // If payment status changed to Paid, create a transaction and update stock
    const wasNotPaid = oldOrder.status !== 'Paid' && oldOrder.paymentStatus !== 'Paid';
    const isNowPaid = order.status === 'Paid' || order.paymentStatus === 'Paid';

    if (wasNotPaid && isNowPaid) {
      console.log('Order payment status changed to paid, creating transaction:', order._id);
      await createTransactionFromOrder(order._id, userId);
      
      // Update inventory stock
      const stockUpdateResult = await updateStockAfterOrder(order._id);
      if (stockUpdateResult.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Inventory updated for order status change:', stockUpdateResult.updates?.length || 0, 'products');
        }
      } else {
        console.error('❌ Stock update failed:', stockUpdateResult.error);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Delete an order for the logged-in user
exports.deleteOrder = async (req, res) => {
  try {
    const userId = req.user.id; 
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      userId: userId 
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found or not authorized to delete" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
