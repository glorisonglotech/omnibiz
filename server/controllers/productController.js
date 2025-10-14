const Product = require("../models/product");

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
    const product = new Product({
      ...req.body,
      userId: req.user._id,
      sku,
      image: req.body.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      featured: req.body.featured || false,
    });

    await product.save();
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

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, userId: req.user._id }, // Ensure userId cannot be changed
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found or you don't have access" });
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