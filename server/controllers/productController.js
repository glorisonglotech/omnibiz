const Product = require("../models/product");
const { getIO } = require('../config/socket');

// Helper: Update product status based on stock quantity
const updateProductStatus = (product) => {
  if (product.stockQuantity === 0) {
    product.status = "Out of Stock";
  } else if (product.stockQuantity <= product.reorderLevel) {
    product.status = "Low Stock";
  } else {
    product.status = "In Stock";
  }
  return product;
};

// Helper: Emit stock alert via Socket.IO
const emitStockAlert = (userId, product, alertType) => {
  try {
    const io = getIO();
    io.to(`user_${userId}`).emit('stock_alert', {
      alertType, // 'low_stock', 'out_of_stock', 'restocked'
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
        reorderLevel: product.reorderLevel,
        status: product.status
      },
      timestamp: new Date()
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📢 Stock Alert [${alertType}]: ${product.name} - Stock: ${product.stockQuantity}`);
    }
  } catch (error) {
    console.error('Socket.IO emit error:', error.message);
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    // Validate required fields
    const { name, price, category, supplierName } = req.body;
    if (!name || !price || !category || !supplierName) {
      return res.status(400).json({ error: "Name, price, category, and supplier name are required" });
    }

    // Generate unique SKU if not provided
    const sku = req.body.sku || `SKU-${Date.now()}`;

    // Ensure the user ID is taken from the logged-in user and include all fields
    let product = new Product({
      ...req.body,
      userId: req.user._id,
      sku,
      image: req.body.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      featured: req.body.featured || false,
    });

    // Update status based on initial stock quantity
    product = updateProductStatus(product);

    await product.save();
    
    // Emit alert if product starts with low/no stock
    if (product.status === "Low Stock") {
      emitStockAlert(req.user._id, product, 'low_stock');
    } else if (product.status === "Out of Stock") {
      emitStockAlert(req.user._id, product, 'out_of_stock');
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all products for the logged-in user
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id }).populate("userId");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id }).populate("userId");
    if (!product) {
      return res.status(404).json({ error: "Product not found or you don't have access" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    // Validate required fields
    const { name, price, category, supplierName } = req.body;
    if (!name || !price || !category || !supplierName) {
      return res.status(400).json({ error: "Name, price, category, and supplier name are required" });
    }

    // Get old product to track stock changes
    const oldProduct = await Product.findOne({ _id: req.params.id, userId: req.user._id });
    if (!oldProduct) {
      return res.status(404).json({ error: "Product not found or you don't have access" });
    }

    const oldStock = oldProduct.stockQuantity;
    const newStock = req.body.stockQuantity !== undefined ? req.body.stockQuantity : oldStock;

    let product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, userId: req.user._id }, // Ensure userId cannot be changed
      { new: true, runValidators: true }
    );

    // Update status based on new stock quantity
    product = updateProductStatus(product);
    await product.save();

    // Emit appropriate alerts based on stock changes
    if (oldStock > 0 && newStock === 0) {
      emitStockAlert(req.user._id, product, 'out_of_stock');
    } else if (oldStock > product.reorderLevel && newStock <= product.reorderLevel && newStock > 0) {
      emitStockAlert(req.user._id, product, 'low_stock');
    } else if (oldStock <= product.reorderLevel && newStock > product.reorderLevel) {
      emitStockAlert(req.user._id, product, 'restocked');
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!product) {
      return res.status(404).json({ error: "Product not found or you don't have access" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};