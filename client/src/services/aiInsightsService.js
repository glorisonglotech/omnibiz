import api from '@/lib/api';

/**
 * AI Insights Service
 * Manages real-time AI insights for business analytics
 */
class AIInsightsService {
  constructor() {
    this.insights = [];
    this.subscribers = [];
    this.intervalId = null;
    this.isRunning = false;
    this.updateInterval = 30000; // 30 seconds default
  }

  /**
   * Subscribe to insights updates
   * @param {Function} callback - Function to call when insights update
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Immediately call with current insights
    callback(this.insights);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Notify all subscribers of insights update
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.insights);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  /**
   * Start real-time insights generation
   * @param {number} interval - Update interval in milliseconds
   */
  startRealTimeInsights(interval = 30000) {
    if (this.isRunning) {
      console.log('AI Insights already running');
      return;
    }

    this.updateInterval = interval;
    this.isRunning = true;

    // Generate initial insights
    this.generateInsights();

    // Set up interval for periodic updates
    this.intervalId = setInterval(() => {
      this.generateInsights();
    }, this.updateInterval);

    console.log('✅ AI Insights service started');
  }

  /**
   * Stop real-time insights generation
   */
  stopRealTimeInsights() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏸️ AI Insights service stopped');
  }

  /**
   * Generate AI insights from business data
   */
  async generateInsights() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No auth token, skipping AI insights generation');
        return;
      }

      const response = await api.get('/ai/insights', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const { insights = [], recommendations = [], metrics = {} } = response.data;
        
        // Process insights with metadata
        const processedInsights = insights.map((insight, index) => ({
          id: `insight_${Date.now()}_${index}`,
          ...insight,
          isNew: true,
          timestamp: new Date(),
          category: insight.category || this.categorizeInsight(insight),
          priority: insight.priority || this.determinePriority(insight),
          actionable: insight.actionable !== false,
          recommendations: insight.recommendations || []
        }));

        // Process recommendations
        const processedRecommendations = recommendations.map((rec, index) => ({
          id: `rec_${Date.now()}_${index}`,
          ...rec,
          isNew: true,
          timestamp: new Date(),
          category: 'recommendation',
          priority: rec.priority || 'medium',
          actionable: true
        }));

        // Combine insights and recommendations
        this.insights = [...processedInsights, ...processedRecommendations];
        
        // Notify subscribers
        this.notifySubscribers();
        
        console.log(`✅ Generated ${this.insights.length} AI insights`);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      
      // Generate fallback insights if API fails
      this.generateFallbackInsights();
    }
  }

  /**
   * Generate fallback insights when AI service is unavailable
   */
  generateFallbackInsights() {
    const fallbackInsights = [
      {
        id: `fallback_${Date.now()}_1`,
        type: 'info',
        title: 'AI Insights Service',
        description: 'Connect your AI service to get real-time business insights and recommendations.',
        category: 'system',
        priority: 'low',
        isNew: false,
        timestamp: new Date(),
        actionable: false
      }
    ];

    this.insights = fallbackInsights;
    this.notifySubscribers();
  }

  /**
   * Categorize insight based on content
   */
  categorizeInsight(insight) {
    const text = (insight.title + ' ' + insight.description).toLowerCase();
    
    if (text.includes('sale') || text.includes('revenue') || text.includes('order')) {
      return 'sales';
    } else if (text.includes('stock') || text.includes('inventory')) {
      return 'inventory';
    } else if (text.includes('customer') || text.includes('client')) {
      return 'customer';
    } else if (text.includes('financial') || text.includes('profit') || text.includes('expense')) {
      return 'finance';
    } else if (text.includes('team') || text.includes('employee')) {
      return 'team';
    }
    
    return 'general';
  }

  /**
   * Determine insight priority
   */
  determinePriority(insight) {
    const text = (insight.title + ' ' + insight.description).toLowerCase();
    
    if (text.includes('critical') || text.includes('urgent') || text.includes('alert')) {
      return 'critical';
    } else if (text.includes('important') || text.includes('warning') || text.includes('low stock')) {
      return 'high';
    } else if (text.includes('opportunity') || text.includes('recommend')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Get all insights
   */
  getInsights() {
    return this.insights;
  }

  /**
   * Mark insight as read
   */
  markAsRead(insightId) {
    this.insights = this.insights.map(insight =>
      insight.id === insightId ? { ...insight, isNew: false } : insight
    );
    this.notifySubscribers();
  }

  /**
   * Clear all insights
   */
  clearInsights() {
    this.insights = [];
    this.notifySubscribers();
  }

  /**
   * Get insights by category
   */
  getInsightsByCategory(category) {
    return this.insights.filter(insight => insight.category === category);
  }

  /**
   * Get insights by priority
   */
  getInsightsByPriority(priority) {
    return this.insights.filter(insight => insight.priority === priority);
  }

  /**
   * Dismiss insight
   */
  dismissInsight(insightId) {
    this.insights = this.insights.filter(insight => insight.id !== insightId);
    this.notifySubscribers();
  }
}

// Create singleton instance
const aiInsightsService = new AIInsightsService();

export default aiInsightsService;
