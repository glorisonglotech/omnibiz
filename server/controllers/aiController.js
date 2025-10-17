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
    const { message, context, systemPrompt, history, dashboardType } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if Gemini AI is initialized
    if (!geminiAI || !geminiAI.initialized) {
      console.error('❌ Gemini AI not initialized. Check GEMINI_API_KEY in .env');
      return res.status(503).json({ 
        error: 'AI service not available. Please contact administrator.',
        details: 'Gemini AI not initialized'
      });
    }

    // Build enriched context based on dashboard type
    const aiContext = {
      businessName: req.user?.businessName || 'Business',
      userName: req.user?.name || 'User',
      userRole: req.user?.role || 'user',
      userId: req.user?._id,
      dashboardType: dashboardType || context?.dashboardType || 'general',
      ...context
    };

    // Dashboard-specific system prompts
    let enhancedPrompt = systemPrompt;
    if (!enhancedPrompt && dashboardType) {
      if (dashboardType === 'admin' || dashboardType === 'main') {
        enhancedPrompt = `You are an AI assistant for a business owner/administrator using the OmniBiz platform.
        
User: ${aiContext.userName} (${aiContext.userRole})
        Business: ${aiContext.businessName}
        
Provide insights about:
        - Business analytics and performance
        - Inventory management
        - Sales trends and revenue
        - Team management
        - Customer analytics
        - Financial reports
        
Be professional, data-driven, and actionable in your responses.`;
      } else if (dashboardType === 'storefront' || dashboardType === 'client') {
        enhancedPrompt = `You are an AI shopping assistant for customers using the ${aiContext.businessName} online store.
        
Help customers with:
        - Product recommendations
        - Order tracking
        - Appointment booking
        - Product information
        - Shopping assistance
        - Customer service
        
Be friendly, helpful, and customer-focused in your responses.`;
      }
    }

    // Build final prompt
    let promptToUse = message;
    if (enhancedPrompt) {
      promptToUse = `${enhancedPrompt}\n\nUser Question: ${message}`;
      
      // Add conversation history context if available
      if (history && Array.isArray(history) && history.length > 0) {
        const historyContext = history.slice(-5).map(h => 
          `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`
        ).join('\n');
        promptToUse = `${enhancedPrompt}\n\nRecent Conversation:\n${historyContext}\n\nUser Question: ${message}`;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🤖 AI Request:', {
        dashboard: dashboardType,
        user: aiContext.userName,
        role: aiContext.userRole,
        messageLength: message.length
      });
    }

    const result = await geminiAI.generateResponse(promptToUse, aiContext);

    if (!result.success) {
      console.error('❌ AI generation failed:', result.error);
      return res.status(500).json({ error: result.error || 'AI response generation failed' });
    }

    res.json({
      response: result.response,
      model: result.model,
      dashboardType: aiContext.dashboardType,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ AI chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
