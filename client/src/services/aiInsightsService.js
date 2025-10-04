class AIInsightsService {
  constructor() {
    this.insights = [];
    this.subscribers = [];
    this.isRunning = false;
    this.updateInterval = null;
    this.websocket = null;
  }

  // Start real-time insights generation
  startRealTimeInsights(interval = 30000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.generateInsights();
    
    this.updateInterval = setInterval(() => {
      this.generateInsights();
    }, interval);

    this.connectWebSocket();
    console.log('🤖 AI Insights service started');
  }

  // Stop real-time insights
  stopRealTimeInsights() {
    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    console.log('🤖 AI Insights service stopped');
  }

  // Generate new insights
  generateInsights() {
    const insightTypes = [
      'sales_prediction',
      'customer_churn',
      'inventory_optimization',
      'pricing_recommendation',
      'market_opportunity',
      'operational_efficiency'
    ];

    // Generate 1-3 new insights
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
      const type = insightTypes[Math.floor(Math.random() * insightTypes.length)];
      const insight = this.generateInsightByType(type);
      
      this.insights.unshift(insight);
    }

    // Keep only last 50 insights
    this.insights = this.insights.slice(0, 50);

    // Notify subscribers
    this.notifySubscribers();
  }

  // Generate insight by type
  generateInsightByType(type) {
    const baseInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      category: type,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      priority: this.calculatePriority()
    };

    switch (type) {
      case 'sales_prediction':
        return {
          ...baseInsight,
          title: 'Sales Forecast Alert',
          description: `Predicted ${Math.floor(Math.random() * 20) + 5}% increase in sales next week`,
          recommendations: [
            'Increase inventory for top-selling products',
            'Prepare marketing campaigns for peak demand',
            'Schedule additional staff for busy periods'
          ],
          data: {
            predictedIncrease: Math.floor(Math.random() * 20) + 5,
            timeframe: '7 days',
            affectedProducts: Math.floor(Math.random() * 10) + 5
          }
        };

      case 'customer_churn':
        return {
          ...baseInsight,
          title: 'Customer Retention Alert',
          description: `${Math.floor(Math.random() * 15) + 5} customers at risk of churning`,
          recommendations: [
            'Send personalized retention offers',
            'Reach out with customer satisfaction survey',
            'Offer loyalty program benefits'
          ],
          data: {
            riskCustomers: Math.floor(Math.random() * 15) + 5,
            churnProbability: Math.floor(Math.random() * 30) + 60,
            potentialRevenueLoss: Math.floor(Math.random() * 5000) + 1000
          }
        };

      case 'inventory_optimization':
        return {
          ...baseInsight,
          title: 'Inventory Optimization',
          description: `${Math.floor(Math.random() * 8) + 3} products need restocking soon`,
          recommendations: [
            'Reorder low-stock items immediately',
            'Adjust reorder points based on demand',
            'Consider bulk purchasing for better rates'
          ],
          data: {
            lowStockItems: Math.floor(Math.random() * 8) + 3,
            daysUntilStockout: Math.floor(Math.random() * 14) + 1,
            reorderValue: Math.floor(Math.random() * 3000) + 500
          }
        };

      case 'pricing_recommendation':
        return {
          ...baseInsight,
          title: 'Dynamic Pricing Opportunity',
          description: `Optimize pricing for ${Math.floor(Math.random() * 12) + 3} products`,
          recommendations: [
            'Increase prices for high-demand items',
            'Offer discounts on slow-moving inventory',
            'Implement dynamic pricing strategy'
          ],
          data: {
            affectedProducts: Math.floor(Math.random() * 12) + 3,
            potentialRevenueIncrease: Math.floor(Math.random() * 2000) + 500,
            priceAdjustmentRange: '5-15%'
          }
        };

      case 'market_opportunity':
        return {
          ...baseInsight,
          title: 'Market Opportunity Detected',
          description: `New market segment showing ${Math.floor(Math.random() * 25) + 10}% growth potential`,
          recommendations: [
            'Develop targeted marketing campaigns',
            'Expand product offerings for this segment',
            'Analyze competitor strategies'
          ],
          data: {
            growthPotential: Math.floor(Math.random() * 25) + 10,
            marketSize: Math.floor(Math.random() * 50000) + 10000,
            competitorCount: Math.floor(Math.random() * 8) + 2
          }
        };

      case 'operational_efficiency':
        return {
          ...baseInsight,
          title: 'Operational Efficiency Alert',
          description: `Identified ${Math.floor(Math.random() * 20) + 5}% efficiency improvement opportunity`,
          recommendations: [
            'Automate repetitive tasks',
            'Optimize workflow processes',
            'Implement performance tracking'
          ],
          data: {
            efficiencyGain: Math.floor(Math.random() * 20) + 5,
            timeSavings: Math.floor(Math.random() * 10) + 2,
            costReduction: Math.floor(Math.random() * 1000) + 200
          }
        };

      default:
        return baseInsight;
    }
  }

  // Calculate priority based on impact and confidence
  calculatePriority() {
    const rand = Math.random();
    if (rand < 0.1) return 'critical';
    if (rand < 0.3) return 'high';
    if (rand < 0.7) return 'medium';
    return 'low';
  }

  // Subscribe to insights updates
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Send current insights immediately
    callback(this.insights);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.insights);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  // Simulate WebSocket connection for real-time updates
  connectWebSocket() {
    // Mock WebSocket connection
    console.log('🔌 AI Insights WebSocket connected');
    
    // Simulate periodic updates
    const wsInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(wsInterval);
        return;
      }
      
      // Occasionally generate urgent insights
      if (Math.random() < 0.1) {
        const urgentInsight = this.generateInsightByType('sales_prediction');
        urgentInsight.priority = 'critical';
        urgentInsight.title = '🚨 Urgent: ' + urgentInsight.title;
        
        this.insights.unshift(urgentInsight);
        this.notifySubscribers();
      }
    }, 45000); // Every 45 seconds
  }

  // Get insights by category
  getInsightsByCategory(category) {
    return this.insights.filter(insight => insight.category === category);
  }

  // Get insights by priority
  getInsightsByPriority(priority) {
    return this.insights.filter(insight => insight.priority === priority);
  }

  // Get recent insights (last N minutes)
  getRecentInsights(minutes = 5) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.insights.filter(insight => new Date(insight.timestamp) > cutoff);
  }

  // Clear all insights
  clearInsights() {
    this.insights = [];
    this.notifySubscribers();
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      insightCount: this.insights.length,
      subscriberCount: this.subscribers.length,
      lastUpdate: this.insights.length > 0 ? this.insights[0].timestamp : null
    };
  }
}

// Create singleton instance
const aiInsightsService = new AIInsightsService();

export default aiInsightsService;
