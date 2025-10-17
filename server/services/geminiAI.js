const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model_name = process.env.GEMINI_MODEL || 'gemini-pro';
    this.visionModel = process.env.GEMINI_VISION_MODEL || 'gemini-pro-vision';
    this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS) || 2048;
    this.temperature = parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7;
    this.initialized = false;
    this.genAI = null;
    this.model = null;

    if (this.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ 
          model: this.model_name,
          generationConfig: {
            temperature: this.temperature,
            maxOutputTokens: this.maxTokens,
          }
        });
        this.initialized = true;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Gemini AI service initialized');
          console.log('   Model:', this.model_name);
          console.log('   Temperature:', this.temperature);
          console.log('   Max Tokens:', this.maxTokens);
        } else {
          console.log('✅ Gemini AI service initialized');
        }
      } catch (error) {
        console.error('❌ Gemini AI initialization error:', error.message);
      }
    } else {
      console.warn('⚠️  Gemini AI not configured (missing GEMINI_API_KEY)');
    }
  }

  /**
   * Generate AI response
   */
  async generateResponse(prompt, context = {}) {
    if (!this.initialized) {
      return {
        success: false,
        error: 'AI service not configured'
      };
    }

    try {
      // Build enhanced prompt with context
      const enhancedPrompt = this.buildPrompt(prompt, context);

      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        response: text,
        model: 'gemini-pro'
      };
    } catch (error) {
      console.error('Gemini AI error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build enhanced prompt with business context
   */
  buildPrompt(userPrompt, context) {
    const { businessName, userName, userRole, dataContext } = context;

    let prompt = `You are an AI business assistant for OmniBiz Pro, a comprehensive business management platform.\n\n`;

    if (businessName) {
      prompt += `Business: ${businessName}\n`;
    }
    if (userName) {
      prompt += `User: ${userName} (${userRole || 'User'})\n`;
    }

    if (dataContext) {
      prompt += `\nBusiness Context:\n`;
      if (dataContext.totalOrders) prompt += `- Total Orders: ${dataContext.totalOrders}\n`;
      if (dataContext.totalRevenue) prompt += `- Total Revenue: ${dataContext.totalRevenue}\n`;
      if (dataContext.totalProducts) prompt += `- Total Products: ${dataContext.totalProducts}\n`;
      if (dataContext.totalCustomers) prompt += `- Total Customers: ${dataContext.totalCustomers}\n`;
    }

    prompt += `\nUser Question: ${userPrompt}\n\n`;
    prompt += `Provide a helpful, concise, and actionable response. Focus on business insights and practical advice.`;

    return prompt;
  }

  /**
   * Generate business insights from data
   */
  async generateBusinessInsights(data) {
    const prompt = `Analyze this business data and provide 3-5 key insights and recommendations:

Orders: ${data.totalOrders || 0}
Revenue: $${data.totalRevenue || 0}
Products: ${data.totalProducts || 0}
Average Order Value: $${data.avgOrderValue || 0}
Top Product: ${data.topProduct || 'N/A'}
Sales Trend: ${data.salesTrend || 'N/A'}

Provide insights in this JSON format:
{
  "insights": [
    { "type": "positive|warning|info", "title": "...", "description": "..." }
  ],
  "recommendations": [
    { "priority": "high|medium|low", "action": "...", "impact": "..." }
  ]
}`;

    const result = await this.generateResponse(prompt);

    if (result.success) {
      try {
        // Try to parse JSON response
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse AI insights JSON:', e);
      }
    }

    return {
      insights: [],
      recommendations: []
    };
  }

  /**
   * Generate sales forecast
   */
  async generateSalesForecast(historicalData) {
    const prompt = `Based on this historical sales data, provide a 30-day sales forecast:

${JSON.stringify(historicalData, null, 2)}

Provide forecast in JSON format with predicted revenue, orders, and confidence level.`;

    return await this.generateResponse(prompt);
  }

  /**
   * Generate customer support response
   */
  async generateSupportResponse(question, ticketContext = {}) {
    const context = {
      dataContext: {
        ticketHistory: ticketContext.previousTickets || 0,
        userSince: ticketContext.userSince,
        category: ticketContext.category
      }
    };

    const prompt = `As a customer support AI, provide a helpful response to this support question:

Question: ${question}

Provide a professional, empathetic, and solution-focused response.`;

    return await this.generateResponse(prompt, context);
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(text) {
    const prompt = `Analyze the sentiment of this text and respond with JSON:

Text: "${text}"

Format: { "sentiment": "positive|negative|neutral", "confidence": 0-100, "summary": "brief explanation" }`;

    const result = await this.generateResponse(prompt);

    if (result.success) {
      try {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse sentiment JSON:', e);
      }
    }

    return {
      sentiment: 'neutral',
      confidence: 0,
      summary: 'Unable to analyze'
    };
  }

  /**
   * Generate marketing copy
   */
  async generateMarketingCopy(product, style = 'professional') {
    const prompt = `Generate compelling marketing copy for this product:

Product Name: ${product.name}
Description: ${product.description || 'N/A'}
Price: ${product.price}
Category: ${product.category || 'N/A'}

Style: ${style}

Provide:
1. A catchy headline
2. Product description (2-3 sentences)
3. Call to action

Format as JSON: { "headline": "...", "description": "...", "cta": "..." }`;

    return await this.generateResponse(prompt);
  }

  /**
   * Chat with streaming (for real-time chat)
   */
  async *generateStreamingResponse(prompt, context = {}) {
    if (!this.initialized) {
      yield { error: 'AI service not configured' };
      return;
    }

    try {
      const enhancedPrompt = this.buildPrompt(prompt, context);
      const result = await this.model.generateContentStream(enhancedPrompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        yield { text };
      }
    } catch (error) {
      console.error('Streaming error:', error);
      yield { error: error.message };
    }
  }
}

// Create singleton instance
const geminiAI = new GeminiAIService();

module.exports = {
  geminiAI,
  GeminiAIService
};
