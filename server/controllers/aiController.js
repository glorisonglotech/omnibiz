const { geminiAI } = require('../services/geminiAI');
const Order = require('../models/order');
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const { getIO } = require('../config/socket');

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context
    const aiContext = {
      businessName: req.user.businessName,
      userName: req.user.name,
      userRole: req.user.role,
      ...context
    };

    const result = await geminiAI.generateResponse(message, aiContext);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      response: result.response,
      model: result.model,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Generate business insights
// @route   GET /api/ai/insights
// @access  Private
exports.generateInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch business data
    const [orders, products, transactions] = await Promise.all([
      Order.find({ userId }).limit(100),
      Product.find({ userId }),
      Transaction.find({ userId }).limit(100)
    ]);

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalProducts = products.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Find top product
    const productSales = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });
    const topProduct = Object.keys(productSales).reduce((a, b) => 
      productSales[a] > productSales[b] ? a : b, 'None'
    );

    // Calculate sales trend
    const recentOrders = orders.slice(0, 30);
    const olderOrders = orders.slice(30, 60);
    const recentRevenue = recentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const olderRevenue = olderOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const salesTrend = recentRevenue > olderRevenue ? 'Increasing' : 
                       recentRevenue < olderRevenue ? 'Decreasing' : 'Stable';

    const data = {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      totalProducts,
      avgOrderValue: avgOrderValue.toFixed(2),
      topProduct,
      salesTrend
    };

    // Generate AI insights
    const insights = await geminiAI.generateBusinessInsights(data);

    // Emit real-time update
    try {
      const io = getIO();
      io.to(`user_${userId}`).emit('ai_insights_updated', {
        insights,
        metrics: data,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
    }

    res.json({
      metrics: data,
      insights: insights.insights || [],
      recommendations: insights.recommendations || [],
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Analyze sentiment
// @route   POST /api/ai/sentiment
// @access  Private
exports.analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await geminiAI.analyzeSentiment(text);

    res.json(result);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Generate marketing copy
// @route   POST /api/ai/marketing
// @access  Private
exports.generateMarketing = async (req, res) => {
  try {
    const { product, style } = req.body;

    if (!product) {
      return res.status(400).json({ error: 'Product details are required' });
    }

    const result = await geminiAI.generateMarketingCopy(product, style);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      copy: result.response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Marketing generation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Generate support response
// @route   POST /api/ai/support-response
// @access  Private (Admin only)
exports.generateSupportResponse = async (req, res) => {
  try {
    const { question, ticketContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await geminiAI.generateSupportResponse(question, ticketContext);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      suggestedResponse: result.response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Support response error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Chat with streaming (SSE)
// @route   GET /api/ai/chat-stream
// @access  Private
exports.chatStream = async (req, res) => {
  try {
    const { message, context } = req.query;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const aiContext = {
      businessName: req.user.businessName,
      userName: req.user.name,
      userRole: req.user.role,
      ...JSON.parse(context || '{}')
    };

    const stream = geminiAI.generateStreamingResponse(message, aiContext);

    for await (const chunk of stream) {
      if (chunk.error) {
        res.write(`data: ${JSON.stringify({ error: chunk.error })}\n\n`);
        break;
      }
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat stream error:', error);
    res.status(500).json({ error: error.message });
  }
};
