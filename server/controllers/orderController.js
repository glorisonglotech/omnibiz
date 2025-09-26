const Order = require("../models/order");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id; 
    const order = new Order({
      ...req.body,
      userId: userId, 
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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
