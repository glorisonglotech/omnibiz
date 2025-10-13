import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  BarChart3, 
  Users, 
  DollarSign,
  Package,
  RefreshCw
} from 'lucide-react';

const RealTimeAIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock AI insights data
  const mockInsights = [
    {
      id: 1,
      type: 'trend',
      priority: 'high',
      title: 'Sales Spike Detected',
      description: 'Your sales have increased by 23% in the last 24 hours compared to the same period last week.',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      recommendation: 'Consider increasing inventory for top-selling items.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 2,
      type: 'alert',
      priority: 'medium',
      title: 'Low Stock Warning',
      description: '5 products are running low on inventory and may need restocking soon.',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      recommendation: 'Review inventory levels and place orders for affected items.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    },
    {
      id: 3,
      type: 'opportunity',
      priority: 'medium',
      title: 'Customer Behavior Pattern',
      description: 'Customers who buy Product A are 67% more likely to purchase Product B within 7 days.',
      icon: Lightbulb,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      recommendation: 'Create a bundle offer or cross-selling campaign for these products.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      id: 4,
      type: 'performance',
      priority: 'low',
      title: 'Peak Hours Identified',
      description: 'Your busiest hours are between 2-4 PM and 7-9 PM on weekdays.',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      recommendation: 'Schedule staff accordingly and consider targeted promotions during these hours.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
    }
  ];

  const loadInsights = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setInsights(mockInsights);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
          <p className="text-gray-600">Real-time business intelligence and recommendations</p>
        </div>
        <Button 
          onClick={loadInsights} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading insights...</span>
          </div>
        ) : (
          insights.map((insight) => {
            const IconComponent = insight.icon;
            return (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${insight.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(insight.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-3">
                    {insight.description}
                  </CardDescription>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">💡 Recommendation:</p>
                    <p className="text-sm text-gray-600">{insight.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {!loading && insights.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
          <p className="text-gray-600">Check back later for AI-powered business insights.</p>
        </div>
      )}
    </div>
  );
};

export default RealTimeAIInsights;
