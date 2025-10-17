const Product = require('../models/product');
const Order = require('../models/order');
const { getIO } = require('../config/socket');

// @desc    Get inventory summary with order tracking
// @route   GET /api/inventory/summary
// @access  Private
exports.getInventorySummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all products
    const products = await Product.find({ userId });

    // Get all orders
    const orders = await Order.find({ userId });

    // Calculate inventory metrics
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
    const lowStockProducts = products.filter(p => (p.stockQuantity || 0) <= (p.reorderLevel || 5));

    // Calculate sold quantities from orders
    const productSales = {};
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        order.items?.forEach(item => {
          const key = item.productId || item.name;
          if (!productSales[key]) {
            productSales[key] = {
              name: item.name,
              totalSold: 0,
              totalRevenue: 0,
              orderCount: 0
            };
          }
          productSales[key].totalSold += item.quantity || 0;
          productSales[key].totalRevenue += (item.quantity || 0) * (item.price || 0);
          productSales[key].orderCount += 1;
        });
      }
    });

    // Enrich products with sales data
    const enrichedProducts = products.map(product => {
      const salesData = productSales[product._id.toString()] || productSales[product.name] || {
        totalSold: 0,
        totalRevenue: 0,
        orderCount: 0
      };

      return {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        stockQuantity: product.stockQuantity || 0,
        reorderLevel: product.reorderLevel || 5,
        price: product.price,
        status: product.status,
        totalSold: salesData.totalSold,
        totalRevenue: salesData.totalRevenue,
        orderCount: salesData.orderCount,
        stockStatus: (product.stockQuantity || 0) === 0 ? 'out_of_stock' :
                     (product.stockQuantity || 0) <= (product.reorderLevel || 5) ? 'low_stock' : 'in_stock',
        reorderNeeded: (product.stockQuantity || 0) <= (product.reorderLevel || 5),
        turnoverRate: (product.stockQuantity || 0) > 0 ? (salesData.totalSold / (product.stockQuantity || 0)) : 0
      };
    });

    // Sort by various metrics
    const topSelling = [...enrichedProducts]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    const topRevenue = [...enrichedProducts]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    const summary = {
      overview: {
        totalProducts,
        totalStock,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: enrichedProducts.filter(p => p.stockQuantity === 0).length,
        totalProductsSold: Object.values(productSales).reduce((sum, p) => sum + p.totalSold, 0),
        totalRevenue: Object.values(productSales).reduce((sum, p) => sum + p.totalRevenue, 0)
      },
      products: enrichedProducts,
      topSelling,
      topRevenue,
      lowStockProducts: enrichedProducts.filter(p => p.reorderNeeded),
      outOfStockProducts: enrichedProducts.filter(p => p.stockQuantity === 0)
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper: Update product status based on stock
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

// @desc    Update stock after order (called internally)
// @route   POST /api/inventory/update-stock
// @access  Private
exports.updateStockAfterOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    
    if (!order || !order.items) {
      return { success: false, error: 'Order not found' };
    }

    const updates = [];
    const stockAlerts = [];

    for (const item of order.items) {
      if (item.productId) {
        const product = await Product.findById(item.productId);
        
        if (product) {
          const oldStock = product.stockQuantity || 0;
          const quantitySold = item.quantity || 0;
          const newStock = Math.max(0, oldStock - quantitySold);
          
          product.stockQuantity = newStock;
          updateProductStatus(product);
          await product.save();

          updates.push({
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            oldStock,
            newStock,
            quantitySold,
            status: product.status
          });

          // Track alerts
          if (newStock === 0) {
            stockAlerts.push({ type: 'out_of_stock', product });
          } else if (newStock <= product.reorderLevel) {
            stockAlerts.push({ type: 'low_stock', product });
          }

          if (process.env.NODE_ENV === 'development') {
            console.log(`📦 Stock Updated: ${product.name} | ${oldStock} → ${newStock} | Status: ${product.status}`);
          }
        }
      }
    }

    // Emit Socket.IO events for stock alerts
    if (stockAlerts.length > 0) {
      try {
        const io = getIO();
        stockAlerts.forEach(alert => {
          io.to(`user_${order.userId}`).emit('stock_alert', {
            alertType: alert.type,
            product: {
              id: alert.product._id,
              name: alert.product.name,
              sku: alert.product.sku,
              stockQuantity: alert.product.stockQuantity,
              reorderLevel: alert.product.reorderLevel,
              status: alert.product.status
            },
            orderId: order._id,
            timestamp: new Date()
          });
        });
      } catch (socketError) {
        console.error('Socket.IO error:', socketError);
      }
    }

    // Emit inventory updated event
    try {
      const io = getIO();
      io.to(`user_${order.userId}`).emit('inventory_updated', {
        updates,
        orderId: order._id,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
    }

    return { success: true, updates, alerts: stockAlerts };
  } catch (error) {
    console.error('Error updating stock:', error);
    return { success: false, error: error.message };
  }
};

// @desc    Get stock movement history
// @route   GET /api/inventory/movements
// @access  Private
exports.getStockMovements = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, startDate, endDate, limit = 100 } = req.query;

    const query = { userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get orders that affected inventory
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const movements = [];

    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productId || item.productId?.toString() === productId) {
          movements.push({
            orderId: order._id,
            orderNumber: order.orderId,
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            type: 'sale',
            date: order.createdAt,
            status: order.status
          });
        }
      });
    });

    res.json(movements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Restock products
// @route   POST /api/inventory/restock
// @access  Private
exports.restockProduct = async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;
    const userId = req.user._id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }

    const product = await Product.findOne({ _id: productId, userId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const oldStock = product.stockQuantity || 0;
    product.stockQuantity = oldStock + quantity;
    updateProductStatus(product);
    await product.save();

    // Emit Socket.IO event
    try {
      const io = getIO();
      io.to(`user_${userId}`).emit('product_restocked', {
        product: {
          id: product._id,
          name: product.name,
          oldStock,
          newStock: product.stock,
          added: quantity
        },
        note,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
    }

    res.json({
      message: 'Product restocked successfully',
      product: {
        id: product._id,
        name: product.name,
        oldStock,
        newStock: product.stock,
        quantityAdded: quantity
      }
    });
  } catch (error) {
    console.error('Error restocking product:', error);
    res.status(500).json({ error: error.message });
  }
};

// Functions are already exported above with exports.functionName
