import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, Clock, Zap, RefreshCw, Filter,
  Lightbulb, Target, DollarSign, Users, ShoppingCart,
  BarChart3, PieChart, Activity, Bell, BellOff
} from 'lucide-react';
import { useRealTimeAI } from '@/hooks/useRealTimeAI';
import { toast } from 'sonner';

const RealTimeAIInsights = ({ 
  title = "AI Insights",
  showControls = true,
  autoStart = true,
  categories = null,
  showNotifications = true,
  updateInterval = 30000
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(showNotifications);

  const {
    insights,
    isActive,
    loading,
    error,
    startAI,
    stopAI,
    toggleAI,
    generateInsights,
    totalInsights,
    newInsights,
    criticalInsights,
    highPriorityInsights,
    actionableInsights
  } = useRealTimeAI({
    autoStart,
    updateInterval,
    showNotifications: notificationsEnabled,
    categories
  });

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sales':
        return <DollarSign className="h-4 w-4" />;
      case 'customers':
        return <Users className="h-4 w-4" />;
      case 'inventory':
        return <ShoppingCart className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'performance':
        return <Target className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const filterInsightsByTab = (insights, tab) => {
    switch (tab) {
      case 'critical':
        return insights.filter(insight => insight.priority === 'critical');
      case 'high':
        return insights.filter(insight => insight.priority === 'high');
      case 'actionable':
        return insights.filter(insight => insight.actionable);
      case 'recent':
        return insights.filter(insight => {
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
          return new Date(insight.timestamp) > hourAgo;
        });
      default:
        return insights;
    }
  };

  const filteredInsights = filterInsightsByTab(insights, activeTab);

  const InsightCard = ({ insight }) => (
    <Card className={`mb-3 border-l-4 ${getPriorityColor(insight.priority)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getPriorityIcon(insight.priority)}
            {getCategoryIcon(insight.category)}
            <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs">
              {insight.category}
            </Badge>
            <Badge variant={insight.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
              {insight.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
        
        {insight.metrics && (
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(insight.metrics).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key}: {typeof value === 'number' ? value.toLocaleString() : value}
              </Badge>
            ))}
          </div>
        )}

        {insight.recommendation && (
          <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-2">
            <strong>Recommendation:</strong> {insight.recommendation}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(insight.timestamp).toLocaleTimeString()}
          </div>
          {insight.actionable && (
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Actionable
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            {title}
            {isActive && (
              <div className="ml-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="ml-1 text-xs text-green-600">Live</span>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Real-time AI-powered business insights and recommendations
          </CardDescription>
        </div>
        
        {showControls && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              variant={isActive ? "destructive" : "default"}
              size="sm"
              onClick={toggleAI}
            >
              {isActive ? 'Stop' : 'Start'} AI
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalInsights}</div>
            <div className="text-xs text-gray-500">Total Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{newInsights}</div>
            <div className="text-xs text-gray-500">New Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalInsights}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{actionableInsights}</div>
            <div className="text-xs text-gray-500">Actionable</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="high">High</TabsTrigger>
            <TabsTrigger value="actionable">Actionable</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Generating insights...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-8 text-red-500">
                <AlertTriangle className="h-8 w-8 mr-2" />
                <span>Error loading insights: {error}</span>
              </div>
            )}

            {!loading && !error && (
              <ScrollArea className="h-96">
                {filteredInsights.length > 0 ? (
                  <div className="space-y-3">
                    {filteredInsights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <Brain className="h-8 w-8 mr-2" />
                    <span>No insights available for this category</span>
                  </div>
                )}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {/* Status */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            {isActive ? 'AI actively monitoring' : 'AI monitoring paused'}
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeAIInsights;
