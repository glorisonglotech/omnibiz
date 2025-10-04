const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');
const Order = require('../models/order');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const UserActivity = require('../models/userActivity');
const Product = require('../models/product');

// @desc    Generate report
// @route   POST /api/reports/generate
// @access  Private
const generateReport = asyncHandler(async (req, res) => {
  const { reportType, timeframe, dateRange, format = 'json' } = req.body;
  const userId = req.user._id;

  // Calculate date range
  let startDate, endDate;
  const now = new Date();
  
  if (dateRange?.from && dateRange?.to) {
    startDate = new Date(dateRange.from);
    endDate = new Date(dateRange.to);
  } else {
    // Default timeframe calculations
    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
    }
  }

  let reportData = {};

  try {
    switch (reportType) {
      case 'sales-summary':
        reportData = await generateSalesReport(userId, startDate, endDate);
        break;
      case 'customer-analysis':
        reportData = await generateCustomerReport(userId, startDate, endDate);
        break;
      case 'financial-overview':
        reportData = await generateFinancialReport(userId, startDate, endDate);
        break;
      case 'inventory-status':
        reportData = await generateInventoryReport(userId, startDate, endDate);
        break;
      case 'activity-log':
        reportData = await generateActivityReport(userId, startDate, endDate);
        break;
      case 'performance-metrics':
        reportData = await generatePerformanceReport(userId, startDate, endDate);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Add metadata
    reportData.metadata = {
      reportType,
      timeframe,
      dateRange: { startDate, endDate },
      generatedAt: new Date(),
      generatedBy: req.user.name
    };

    res.json({
      success: true,
      data: reportData,
      downloadUrl: null // For now, return data directly
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

// Helper functions for different report types
const generateSalesReport = async (userId, startDate, endDate) => {
  const orders = await Order.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('items.product');

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statusBreakdown = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return {
    summary: {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusBreakdown
    },
    orders: orders.map(order => ({
      orderId: order.orderId,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.items.length
    }))
  };
};

const generateCustomerReport = async (userId, startDate, endDate) => {
  const orders = await Order.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const customerData = orders.reduce((acc, order) => {
    const customerId = order.customerId || 'guest';
    if (!acc[customerId]) {
      acc[customerId] = {
        orderCount: 0,
        totalSpent: 0,
        lastOrder: null
      };
    }
    acc[customerId].orderCount++;
    acc[customerId].totalSpent += order.total;
    acc[customerId].lastOrder = order.createdAt;
    return acc;
  }, {});

  return {
    totalCustomers: Object.keys(customerData).length,
    customerData,
    topCustomers: Object.entries(customerData)
      .sort(([,a], [,b]) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
  };
};

const generateFinancialReport = async (userId, startDate, endDate) => {
  const orders = await Order.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const transactions = await Transaction.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    transactions: transactions.length,
    orders: orders.length
  };
};

const generateInventoryReport = async (userId, startDate, endDate) => {
  const products = await Product.find({ userId });
  
  return {
    totalProducts: products.length,
    lowStockItems: products.filter(p => p.stock < 10),
    outOfStockItems: products.filter(p => p.stock === 0),
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };
};

const generateActivityReport = async (userId, startDate, endDate) => {
  const activities = await UserActivity.find({
    userId,
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: -1 });

  const categoryBreakdown = activities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + 1;
    return acc;
  }, {});

  return {
    totalActivities: activities.length,
    categoryBreakdown,
    recentActivities: activities.slice(0, 50)
  };
};

const generatePerformanceReport = async (userId, startDate, endDate) => {
  const orders = await Order.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const activities = await UserActivity.find({
    userId,
    timestamp: { $gte: startDate, $lte: endDate }
  });

  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalActivities: activities.length
  };
};

// @desc    Get available reports
// @route   GET /api/reports/available
// @access  Private
const getAvailableReports = asyncHandler(async (req, res) => {
  const reports = [
    {
      id: 'sales-summary',
      name: 'Sales Summary',
      description: 'Comprehensive overview of sales performance',
      category: 'Sales'
    },
    {
      id: 'customer-analysis',
      name: 'Customer Analysis',
      description: 'Customer behavior and purchasing patterns',
      category: 'Customers'
    },
    {
      id: 'financial-overview',
      name: 'Financial Overview',
      description: 'Revenue, expenses, and profit analysis',
      category: 'Finance'
    },
    {
      id: 'inventory-status',
      name: 'Inventory Status',
      description: 'Current stock levels and inventory value',
      category: 'Inventory'
    },
    {
      id: 'activity-log',
      name: 'Activity Log',
      description: 'User activities and system events',
      category: 'System'
    },
    {
      id: 'performance-metrics',
      name: 'Performance Metrics',
      description: 'Key performance indicators and trends',
      category: 'Analytics'
    }
  ];

  res.json({ success: true, data: reports });
});

router.post('/generate', protect, generateReport);
router.get('/available', protect, getAvailableReports);

module.exports = router;
