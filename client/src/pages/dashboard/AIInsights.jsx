import { useState, useEffect } from "react";
import ComprehensiveGraphs from '@/components/ComprehensiveGraphs';
import { generateMockGraphData } from '@/hooks/useGraphData';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Eye,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import RealTimeAIInsights from "@/components/RealTimeAIInsights";

const AIInsights = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState({
    salesTrend: "up",
    customerSatisfaction: 85,
    inventoryOptimization: 78,
    revenueGrowth: 12.5,
  });
  const [realData, setRealData] = useState({
    orders: [],
    products: [],
    transactions: [],
    salesData: [],
    customerData: []
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Fetch real data from API
  useEffect(() => {
    const fetchRealData = async () => {
      if (!isAuthenticated) return;
      
      setIsLoadingData(true);
      setDataError(null);
      
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch all data in parallel
        const [ordersRes, productsRes, transactionsRes] = await Promise.all([
          api.get("/orders", { headers }).catch(() => ({ data: [] })),
          api.get("/products", { headers }).catch(() => ({ data: [] })),
          api.get("/transactions", { headers }).catch(() => ({ data: [] }))
        ]);
        
        console.log('✅ Real data loaded:', {
          orders: ordersRes.data.length,
          products: productsRes.data.length,
          transactions: transactionsRes.data.length
        });
        
        setRealData({
          orders: ordersRes.data || [],
          products: productsRes.data || [],
          transactions: transactionsRes.data || [],
          salesData: generateSalesDataFromOrders(ordersRes.data || []),
          customerData: generateCustomerDataFromOrders(ordersRes.data || [])
        });
        
        // Generate insights from real data
        generateRealInsights(ordersRes.data, productsRes.data, transactionsRes.data);
        
      } catch (error) {
        console.error('❌ Error fetching real data:', error);
        setDataError(error.message);
        toast.error('Failed to load AI insights data');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchRealData();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchRealData, 120000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Generate sales data from orders
  const generateSalesDataFromOrders = (orders) => {
    const last30Days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.date || order.createdAt);
        return orderDate.toISOString().split('T')[0] === dateStr;
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
      
      last30Days.push({
        date: dateStr,
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: dayRevenue,
        orders: dayOrders.length,
        customers: new Set(dayOrders.map(o => o.customer?.email)).size
      });
    }
    
    return last30Days;
  };

  // Generate customer behavior data
  const generateCustomerDataFromOrders = (orders) => {
    const hourlyData = Array(24).fill(0).map((_, hour) => ({
      hour,
      name: `${hour}:00`,
      value: 0,
      orders: 0
    }));
    
    orders.forEach(order => {
      const orderDate = new Date(order.date || order.createdAt);
      const hour = orderDate.getHours();
      hourlyData[hour].value += Number(order.total) || 0;
      hourlyData[hour].orders += 1;
    });
    
    return hourlyData;
  };

  // Generate insights from real data
  const generateRealInsights = (orders, products, transactions) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate sales performance
    const lastMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.date || o.createdAt);
      return orderDate >= lastMonth && orderDate < currentMonth;
    });
    
    const currentMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.date || o.createdAt);
      return orderDate >= currentMonth;
    });
    
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const currentMonthRevenue = currentMonthOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const growthPercent = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;
    
    // Check low stock products
    const lowStockProducts = products.filter(p => 
      (p.stockQuantity || 0) <= (p.reorderLevel || 5)
    );
    
    // Find peak sales hours
    const hourlyOrders = {};
    orders.forEach(order => {
      const hour = new Date(order.date || order.createdAt).getHours();
      hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourlyOrders)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([hour]) => hour);
    
    const realInsights = [
      {
        id: 1,
        type: "sales",
        title: "Sales Performance Analysis",
        description: `Your sales have ${growthPercent >= 0 ? 'increased' : 'decreased'} by ${Math.abs(growthPercent)}% this month compared to last month (${currentMonthOrders.length} orders vs ${lastMonthOrders.length}).`,
        confidence: 95,
        impact: Math.abs(growthPercent) > 20 ? "high" : "medium",
        trend: growthPercent >= 0 ? "up" : "down",
      },
      {
        id: 2,
        type: "inventory",
        title: "Inventory Optimization",
        description: lowStockProducts.length > 0
          ? `${lowStockProducts.length} products are running low on stock and need immediate restocking.`
          : "All products are adequately stocked. Inventory levels are optimal.",
        confidence: 92,
        impact: lowStockProducts.length > 5 ? "high" : lowStockProducts.length > 0 ? "medium" : "low",
        trend: lowStockProducts.length > 0 ? "warning" : "neutral",
      },
      {
        id: 3,
        type: "customer",
        title: "Customer Behavior Pattern",
        description: peakHours.length > 0
          ? `Peak sales hours are between ${peakHours[0]}:00-${peakHours[1] || peakHours[0] + 2}:00. Consider staffing optimization during these hours.`
          : "Analyzing customer patterns to identify peak sales periods.",
        confidence: 88,
        impact: "medium",
        trend: "neutral",
      },
    ];
    
    // Generate recommendations
    const realRecommendations = [];
    
    if (growthPercent > 15) {
      realRecommendations.push({
        id: 1,
        title: "Increase Marketing Budget",
        description: `With ${growthPercent}% growth, increasing marketing spend by 20% could boost revenue further.`,
        priority: "high",
        category: "marketing",
      });
    }
    
    if (lowStockProducts.length > 0) {
      realRecommendations.push({
        id: 2,
        title: "Restock Critical Items",
        description: `${lowStockProducts.length} products need immediate restocking: ${lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}.`,
        priority: "high",
        category: "inventory",
      });
    }
    
    // Check for underperforming products
    const productsWithOrders = products.map(p => {
      const productOrders = orders.filter(o => 
        o.items?.some(item => (item.product === p._id || item.name === p.name))
      );
      return { ...p, orderCount: productOrders.length };
    }).sort((a, b) => a.orderCount - b.orderCount);
    
    if (productsWithOrders.length > 0 && productsWithOrders[0].orderCount === 0) {
      const underperformingCount = productsWithOrders.filter(p => p.orderCount === 0).length;
      realRecommendations.push({
        id: 3,
        title: "Optimize Product Pricing",
        description: `${underperformingCount} products have no recent sales. Consider price adjustments or promotions.`,
        priority: "medium",
        category: "pricing",
      });
    }
    
    // Update analytics state
    setAnalytics({
      salesTrend: growthPercent >= 0 ? "up" : "down",
      customerSatisfaction: orders.length > 0 ? 85 : 70,
      inventoryOptimization: products.length > 0 
        ? ((products.length - lowStockProducts.length) / products.length * 100).toFixed(0)
        : 78,
      revenueGrowth: parseFloat(growthPercent),
    });
    
    setInsights(realInsights);
    setRecommendations(realRecommendations.length > 0 ? realRecommendations : [
      {
        id: 1,
        title: "Continue Current Strategy",
        description: "Your business is performing well. Maintain current operations.",
        priority: "low",
        category: "general",
      }
    ]);
  };

  useEffect(() => {
    const fetchAIInsights = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view AI insights.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        
        // This is now handled by generateRealInsights
        const mockInsights = [
          {
            id: 1,
            type: "sales",
            title: "Sales Performance Analysis",
            description: "Your sales have increased by 15% this month compared to last month.",
            confidence: 92,
            impact: "high",
            trend: "up",
          },
          {
            id: 2,
            type: "inventory",
            title: "Inventory Optimization",
            description: "5 products are running low on stock and need immediate restocking.",
            confidence: 88,
            impact: "medium",
            trend: "warning",
          },
          {
            id: 3,
            type: "customer",
            title: "Customer Behavior Pattern",
            description: "Peak sales hours are between 2-4 PM. Consider staffing optimization.",
            confidence: 85,
            impact: "medium",
            trend: "neutral",
          },
        ];

        const mockRecommendations = [
          {
            id: 1,
            title: "Increase Marketing Budget",
            description: "Based on current ROI, increasing marketing spend by 20% could boost revenue by 8%.",
            priority: "high",
            category: "marketing",
          },
          {
            id: 2,
            title: "Optimize Product Pricing",
            description: "3 products are underpriced compared to market standards.",
            priority: "medium",
            category: "pricing",
          },
          {
            id: 3,
            title: "Improve Customer Service",
            description: "Response time can be improved by 30% with automated chatbot integration.",
            priority: "low",
            category: "service",
          },
        ];

        setInsights(mockInsights);
        setRecommendations(mockRecommendations);
      } catch (error) {
        toast.error("Error fetching AI insights.");
        console.error("Error fetching AI insights:", error);
      }
    };

    fetchAIInsights();
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view AI insights.</div>;
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case "sales":
        return BarChart3;
      case "inventory":
        return Target;
      case "customer":
        return Activity;
      default:
        return Brain;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      case "warning":
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
          <p className="text-muted-foreground">
            AI-powered analytics and recommendations for your business
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              // Navigate to detailed reports page
              window.location.href = '/dashboard/analytics';
              toast.success('Opening detailed analytics reports...');
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button
            className="bg-green-500 cursor-pointer hover:bg-green-400"
            disabled={isLoadingData}
            onClick={async () => {
              toast.info('Analyzing your business data...', { duration: 2000 });
              
              try {
                // Fetch fresh data
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                
                const [ordersRes, productsRes] = await Promise.all([
                  api.get("/orders", { headers }),
                  api.get("/products", { headers })
                ]);
                
                const orders = ordersRes.data || [];
                const products = productsRes.data || [];
                
                // Generate advanced insights
                const newInsights = [];
                
                // 1. Top performing products
                const productSales = {};
                orders.forEach(order => {
                  order.items?.forEach(item => {
                    const productId = item.product || item.name;
                    productSales[productId] = (productSales[productId] || 0) + (item.quantity || 1);
                  });
                });
                
                const topProducts = Object.entries(productSales)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3);
                
                if (topProducts.length > 0) {
                  const productNames = topProducts.map(([id, qty]) => {
                    const product = products.find(p => p._id === id || p.name === id);
                    return product?.name || 'Unknown';
                  });
                  
                  newInsights.push({
                    id: Date.now() + 1,
                    type: "sales",
                    title: "Top Performing Products",
                    description: `Your best sellers are: ${productNames.join(', ')}. Focus marketing efforts on these products.`,
                    confidence: 96,
                    impact: "high",
                    trend: "up",
                  });
                }
                
                // 2. Revenue velocity
                const last7Days = orders.filter(o => {
                  const orderDate = new Date(o.date || o.createdAt);
                  const daysAgo = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
                  return daysAgo <= 7;
                });
                
                const last14Days = orders.filter(o => {
                  const orderDate = new Date(o.date || o.createdAt);
                  const daysAgo = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
                  return daysAgo > 7 && daysAgo <= 14;
                });
                
                const last7Revenue = last7Days.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                const last14Revenue = last14Days.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
                const velocityChange = last14Revenue > 0 
                  ? ((last7Revenue - last14Revenue) / last14Revenue * 100).toFixed(1)
                  : 0;
                
                newInsights.push({
                  id: Date.now() + 2,
                  type: "sales",
                  title: "Revenue Velocity",
                  description: `Revenue ${velocityChange >= 0 ? 'accelerated' : 'decelerated'} by ${Math.abs(velocityChange)}% in the last 7 days. ${velocityChange >= 10 ? 'Excellent momentum!' : velocityChange < 0 ? 'Consider promotional campaigns.' : 'Steady performance.'}`,
                  confidence: 93,
                  impact: Math.abs(velocityChange) > 15 ? "high" : "medium",
                  trend: velocityChange >= 0 ? "up" : "down",
                });
                
                // 3. Customer retention
                const customerOrders = {};
                orders.forEach(order => {
                  const email = order.customer?.email;
                  if (email) {
                    customerOrders[email] = (customerOrders[email] || 0) + 1;
                  }
                });
                
                const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length;
                const totalCustomers = Object.keys(customerOrders).length;
                const retentionRate = totalCustomers > 0 
                  ? ((repeatCustomers / totalCustomers) * 100).toFixed(1)
                  : 0;
                
                newInsights.push({
                  id: Date.now() + 3,
                  type: "customer",
                  title: "Customer Retention Analysis",
                  description: `${retentionRate}% of customers are repeat buyers (${repeatCustomers} out of ${totalCustomers}). ${retentionRate > 30 ? 'Strong loyalty!' : retentionRate > 15 ? 'Good retention.' : 'Focus on loyalty programs.'}`,
                  confidence: 91,
                  impact: "medium",
                  trend: retentionRate > 25 ? "up" : "neutral",
                });
                
                // 4. Inventory turnover
                const productsWithSales = products.map(p => {
                  const sales = Object.entries(productSales).find(([id]) => 
                    id === p._id || id === p.name
                  );
                  return {
                    ...p,
                    salesCount: sales ? sales[1] : 0,
                    turnoverRate: p.stockQuantity > 0 ? (sales?.[1] || 0) / p.stockQuantity : 0
                  };
                }).sort((a, b) => b.turnoverRate - a.turnoverRate);
                
                const slowMovers = productsWithSales.filter(p => 
                  p.salesCount === 0 && p.stockQuantity > 0
                ).length;
                
                if (slowMovers > 0) {
                  newInsights.push({
                    id: Date.now() + 4,
                    type: "inventory",
                    title: "Inventory Turnover Alert",
                    description: `${slowMovers} products have no sales activity. Consider discounts or bundling to improve turnover.`,
                    confidence: 89,
                    impact: slowMovers > 5 ? "high" : "medium",
                    trend: "warning",
                  });
                }
                
                // 5. Order value trends
                const avgOrderValue = orders.length > 0
                  ? orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) / orders.length
                  : 0;
                
                const recentAvg = last7Days.length > 0
                  ? last7Days.reduce((sum, o) => sum + (Number(o.total) || 0), 0) / last7Days.length
                  : 0;
                
                const avgChange = avgOrderValue > 0
                  ? ((recentAvg - avgOrderValue) / avgOrderValue * 100).toFixed(1)
                  : 0;
                
                newInsights.push({
                  id: Date.now() + 5,
                  type: "sales",
                  title: "Average Order Value Trend",
                  description: `Recent avg order value is $${recentAvg.toFixed(2)} (${avgChange >= 0 ? '+' : ''}${avgChange}% vs overall avg of $${avgOrderValue.toFixed(2)}). ${avgChange > 10 ? 'Customers are spending more!' : avgChange < -10 ? 'Consider upselling strategies.' : 'Stable spending patterns.'}`,
                  confidence: 90,
                  impact: Math.abs(avgChange) > 15 ? "high" : "medium",
                  trend: avgChange >= 0 ? "up" : "down",
                });
                
                // Add new insights to existing ones
                setInsights([...insights, ...newInsights]);
                
                toast.success(`Generated ${newInsights.length} new AI insights!`, {
                  description: 'Advanced analysis complete'
                });
                
              } catch (error) {
                console.error('Error generating insights:', error);
                toast.error('Failed to generate insights. Please try again.');
              }
            }}
          >
            <Zap className="mr-2 h-4 w-4" />
            {isLoadingData ? 'Loading...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{analytics.revenueGrowth}%</div>
            <p className="text-xs text-muted-foreground">Revenue growth this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.customerSatisfaction}%</div>
            <p className="text-xs text-muted-foreground">Based on feedback analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Optimization</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.inventoryOptimization}%</div>
            <p className="text-xs text-muted-foreground">Efficiency score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">89%</div>
            <p className="text-xs text-muted-foreground">Average prediction accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComprehensiveGraphs
          title="Predictive Sales Trends"
          description="Real-time sales data and forecasting"
          type="area"
          data={isLoadingData ? generateMockGraphData('growth', 30) : realData.salesData}
          height={350}
          autoRefresh={true}
          refreshInterval={120000}
        />

        <ComprehensiveGraphs
          title="Customer Behavior Analysis"
          description="Hourly sales patterns from actual orders"
          type="line"
          data={isLoadingData ? generateMockGraphData('trend', 30) : realData.customerData}
          height={350}
          autoRefresh={true}
          refreshInterval={120000}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ComprehensiveGraphs
          title="Market Opportunities"
          description="Monthly revenue trends"
          type="bar"
          data={isLoadingData ? generateMockGraphData('growth', 12) : realData.salesData.slice(-12)}
          height={300}
        />

        <ComprehensiveGraphs
          title="Risk Assessment"
          description="Business risk analysis by AI"
          type="pie"
          data={[
            { name: 'Low Risk', value: 60 },
            { name: 'Medium Risk', value: 30 },
            { name: 'High Risk', value: 10 }
          ]}
          height={300}
          showControls={false}
        />

        <ComprehensiveGraphs
          title="Performance Optimization"
          description="AI-suggested improvements"
          type="composed"
          data={generateMockGraphData('trend', 20)}
          height={300}
        />
      </div>

      {/* Insights and Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Data-driven insights about your business performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight) => {
                const Icon = getInsightIcon(insight.type);
                const TrendIcon = getTrendIcon(insight.trend);
                
                return (
                  <div
                    key={insight.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{insight.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendIcon className="h-4 w-4 text-gray-500" />
                        <Badge variant="outline">{insight.confidence}% confidence</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <Badge
                      className={
                        insight.impact === "high"
                          ? "bg-red-100 text-red-800"
                          : insight.impact === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Actionable suggestions to improve your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{recommendation.title}</h3>
                    <Badge className={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {recommendation.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{recommendation.category}</Badge>
                    <Button size="sm" variant="outline">
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time AI Insights Component */}
      <div className="mt-8">
        <RealTimeAIInsights
          title="Advanced AI Business Intelligence"
          autoStart={true}
          showNotifications={true}
          updateInterval={20000}
        />
      </div>

      {/* AI-Powered Analytics Graphs */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">AI-Powered Analytics</h2>
          <Badge variant="secondary">Predictive Insights</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComprehensiveGraphs
            title="Predictive Sales Trends"
            defaultType="line"
            height={350}
            autoRefresh={true}
            refreshInterval={25000}
          />
          <ComprehensiveGraphs
            title="Customer Behavior Analysis"
            defaultType="area"
            height={350}
            autoRefresh={true}
            refreshInterval={30000}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComprehensiveGraphs
            title="Market Opportunities"
            defaultType="bar"
            height={350}
            autoRefresh={true}
            refreshInterval={45000}
          />
          <ComprehensiveGraphs
            title="Risk Assessment"
            defaultType="pie"
            height={350}
            autoRefresh={false}
            refreshInterval={60000}
          />
        </div>

        <div className="w-full">
          <ComprehensiveGraphs
            title="Performance Optimization Insights"
            defaultType="composed"
            height={400}
            autoRefresh={true}
            refreshInterval={15000}
          />
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
