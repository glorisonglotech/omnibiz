const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

/**
 * Unified AI Service with Gemini as primary and DeepSeek as fallback
 */
class AIService {
  constructor() {
    // Gemini Configuration
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiModel = 'gemini-2.0-flash-exp'; // Latest stable model (2025)
    this.geminiVisionModel = 'gemini-2.0-flash-exp'; // Latest stable model (2025)
    
    // DeepSeek Configuration
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    this.deepseekBaseUrl = 'https://api.deepseek.com/v1';
    this.deepseekModel = 'deepseek-chat';
    
    // Common Configuration
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 2048;
    this.temperature = parseFloat(process.env.AI_TEMPERATURE) || 0.7;
    
    // Service state
    this.geminiInitialized = false;
    this.deepseekInitialized = false;
    this.genAI = null;
    this.geminiModelInstance = null;
    this.currentProvider = null;

    this.initializeServices();
  }

  /**
   * Initialize both AI services
   */
  initializeServices() {
    // Initialize Gemini
    if (this.geminiApiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
        this.geminiModelInstance = this.genAI.getGenerativeModel({ 
          model: this.geminiModel,
          generationConfig: {
            temperature: this.temperature,
            maxOutputTokens: this.maxTokens,
          }
        });
        this.geminiInitialized = true;
        this.currentProvider = 'gemini';
        
        console.log('✅ Gemini AI service initialized (Primary)');
        console.log('   Model:', this.geminiModel);
        console.log('   Temperature:', this.temperature);
        console.log('   Max Tokens:', this.maxTokens);
      } catch (error) {
        console.error('❌ Gemini AI initialization error:', error.message);
      }
    } else {
      console.warn('⚠️  Gemini AI not configured (missing GEMINI_API_KEY)');
    }

    // Initialize DeepSeek
    if (this.deepseekApiKey) {
      try {
        // Test DeepSeek connection
        this.deepseekInitialized = true;
        if (!this.geminiInitialized) {
          this.currentProvider = 'deepseek';
        }
        
        console.log('✅ DeepSeek AI service initialized (Fallback)');
        console.log('   Model:', this.deepseekModel);
        console.log('   Temperature:', this.temperature);
        console.log('   Max Tokens:', this.maxTokens);
      } catch (error) {
        console.error('❌ DeepSeek AI initialization error:', error.message);
      }
    } else {
      console.warn('⚠️  DeepSeek AI not configured (missing DEEPSEEK_API_KEY)');
    }

    // Check if at least one service is available
    if (!this.geminiInitialized && !this.deepseekInitialized) {
      console.error('❌ No AI service configured! Please set GEMINI_API_KEY or DEEPSEEK_API_KEY');
    }

    this.initialized = this.geminiInitialized || this.deepseekInitialized;
  }

  /**
   * Generate response using Gemini
   */
  async generateWithGemini(prompt) {
    if (!this.geminiInitialized) {
      throw new Error('Gemini AI not initialized');
    }

    try {
      const result = await this.geminiModelInstance.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        response: text,
        model: 'gemini-pro',
        provider: 'gemini'
      };
    } catch (error) {
      console.error('Gemini AI error:', error);
      throw error;
    }
  }

  /**
   * Generate response using DeepSeek
   */
  async generateWithDeepSeek(prompt) {
    if (!this.deepseekInitialized) {
      throw new Error('DeepSeek AI not initialized');
    }

    try {
      const response = await axios.post(
        `${this.deepseekBaseUrl}/chat/completions`,
        {
          model: this.deepseekModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.deepseekApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const text = response.data.choices[0].message.content;

      return {
        success: true,
        response: text,
        model: this.deepseekModel,
        provider: 'deepseek'
      };
    } catch (error) {
      console.error('DeepSeek AI error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate AI response with automatic fallback
   */
  async generateResponse(prompt, context = {}) {
    if (!this.initialized) {
      return {
        success: false,
        error: 'No AI service configured'
      };
    }

    // Build enhanced prompt with context
    const enhancedPrompt = this.buildPrompt(prompt, context);

    // Try Gemini first (if available)
    if (this.geminiInitialized) {
      try {
        const result = await this.generateWithGemini(enhancedPrompt);
        return result;
      } catch (error) {
        console.warn('⚠️  Gemini failed, falling back to DeepSeek...', error.message);
        
        // Fallback to DeepSeek
        if (this.deepseekInitialized) {
          try {
            const result = await this.generateWithDeepSeek(enhancedPrompt);
            console.log('✅ DeepSeek fallback successful');
            return result;
          } catch (deepseekError) {
            console.error('❌ DeepSeek fallback also failed:', deepseekError.message);
            return {
              success: false,
              error: 'Both AI services failed',
              details: {
                gemini: error.message,
                deepseek: deepseekError.message
              }
            };
          }
        } else {
          return {
            success: false,
            error: error.message
          };
        }
      }
    }
    
    // If Gemini not available, try DeepSeek directly
    if (this.deepseekInitialized) {
      try {
        const result = await this.generateWithDeepSeek(enhancedPrompt);
        return result;
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }

    return {
      success: false,
      error: 'No AI service available'
    };
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
   * Note: Streaming only works with Gemini for now
   */
  async *generateStreamingResponse(prompt, context = {}) {
    const enhancedPrompt = this.buildPrompt(prompt, context);

    // Try Gemini streaming first
    if (this.geminiInitialized) {
      try {
        const result = await this.geminiModelInstance.generateContentStream(enhancedPrompt);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          yield { text, provider: 'gemini' };
        }
        return;
      } catch (error) {
        console.error('Gemini streaming error:', error);
        // Fall through to DeepSeek non-streaming
      }
    }

    // Fallback to DeepSeek (non-streaming)
    if (this.deepseekInitialized) {
      try {
        const result = await this.generateWithDeepSeek(enhancedPrompt);
        if (result.success) {
          // Simulate streaming by yielding the whole response
          yield { text: result.response, provider: 'deepseek' };
        } else {
          yield { error: result.error };
        }
      } catch (error) {
        yield { error: error.message };
      }
    } else {
      yield { error: 'No AI service available for streaming' };
    }
  }

  /**
   * Get current provider status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      currentProvider: this.currentProvider,
      gemini: {
        available: this.geminiInitialized,
        model: this.geminiModel
      },
      deepseek: {
        available: this.deepseekInitialized,
        model: this.deepseekModel
      },
      config: {
        temperature: this.temperature,
        maxTokens: this.maxTokens
      }
    };
  }
}

// Create singleton instance
const aiService = new AIService();

module.exports = {
  aiService,
  AIService
};

