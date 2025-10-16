const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

// Optional auth; enable read-only search even for guests if needed by removing protect
router.use(protect);

const safeRegex = (q) => {
  try {
    return new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  } catch {
    return new RegExp(q, 'i');
  }
};

// GET /api/search?q=...
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ products: [], orders: [], customers: [] });
    const rx = safeRegex(q);

    const [products, orders, customers] = await Promise.all([
      Product.find({ $or: [{ name: rx }, { description: rx }, { category: rx }] }).limit(10),
      Order.find({ $or: [{ orderId: rx }, { 'customer.name': rx }, { status: rx }] }).limit(10),
      User.find({ role: { $in: ['client', 'customer'] }, $or: [{ name: rx }, { email: rx }] }).select('name email role').limit(10)
    ]);

    res.json({ products, orders, customers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/search/:category?q=...
router.get('/:category', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const category = req.params.category;
    const rx = safeRegex(q);

    switch (category) {
      case 'products': {
        const products = q ? await Product.find({ $or: [{ name: rx }, { description: rx }, { category: rx }] }).limit(20) : [];
        return res.json(products);
      }
      case 'orders': {
        const orders = q ? await Order.find({ $or: [{ orderId: rx }, { 'customer.name': rx }, { status: rx }] }).limit(20) : [];
        return res.json(orders);
      }
      case 'customers': {
        const customers = q ? await User.find({ role: { $in: ['client', 'customer'] }, $or: [{ name: rx }, { email: rx }] }).select('name email role').limit(20) : [];
        return res.json(customers);
      }
      default:
        return res.status(404).json({ message: 'Unknown category' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


