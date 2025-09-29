import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchAIInsights = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view AI insights.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        
        // Simulate AI insights data (replace with actual API calls)
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
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button className="bg-green-500 cursor-pointer hover:bg-green-400">
            <Zap className="mr-2 h-4 w-4" />
            Generate Insights
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
    </div>
  );
};

export default AIInsights;
