import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Calendar,
  Target,
  Activity,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 125000,
      totalOrders: 1250,
      totalCustomers: 850,
      averageOrderValue: 100,
      growthRate: 12.5,
      conversionRate: 3.2
    },
    salesTrends: {
      daily: [
        { date: '2024-01-01', revenue: 4200, orders: 42 },
        { date: '2024-01-02', revenue: 3800, orders: 38 },
        { date: '2024-01-03', revenue: 5100, orders: 51 },
        { date: '2024-01-04', revenue: 4600, orders: 46 },
        { date: '2024-01-05', revenue: 5300, orders: 53 },
        { date: '2024-01-06', revenue: 4900, orders: 49 },
        { date: '2024-01-07', revenue: 5800, orders: 58 }
      ],
      topProducts: [
        { name: 'Premium Package', sales: 245, revenue: 24500 },
        { name: 'Standard Service', sales: 189, revenue: 18900 },
        { name: 'Basic Plan', sales: 156, revenue: 7800 },
        { name: 'Enterprise Solution', sales: 89, revenue: 44500 },
        { name: 'Consultation', sales: 234, revenue: 11700 }
      ]
    },
    customerInsights: {
      demographics: {
        ageGroups: [
          { range: '18-25', percentage: 15 },
          { range: '26-35', percentage: 35 },
          { range: '36-45', percentage: 28 },
          { range: '46-55', percentage: 15 },
          { range: '55+', percentage: 7 }
        ],
        locations: [
          { city: 'Nairobi', customers: 425 },
          { city: 'Mombasa', customers: 189 },
          { city: 'Kisumu', customers: 156 },
          { city: 'Nakuru', customers: 80 }
        ]
      },
      behavior: {
        averageSessionTime: '4m 32s',
        bounceRate: 24.5,
        repeatCustomers: 68.2,
        customerLifetimeValue: 450
      }
    },
    performance: {
      goals: [
        { name: 'Monthly Revenue', target: 150000, current: 125000, percentage: 83.3 },
        { name: 'New Customers', target: 200, current: 156, percentage: 78 },
        { name: 'Order Volume', target: 1500, current: 1250, percentage: 83.3 },
        { name: 'Customer Satisfaction', target: 95, current: 92, percentage: 96.8 }
      ],
      kpis: {
        revenueGrowth: 12.5,
        customerGrowth: 8.3,
        orderGrowth: 15.2,
        profitMargin: 24.8
      }
    }
  });

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Analytics data refreshed!');
    }, 1000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{formatPercentage(analyticsData.overview.growthRate)} from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{formatPercentage(15.2)} from last month
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalCustomers.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{formatPercentage(8.3)} from last month
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.averageOrderValue)}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -{formatPercentage(2.1)} from last month
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Sales Trends
                </CardTitle>
                <CardDescription>Daily revenue and order trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.salesTrends.daily.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{formatCurrency(day.revenue)}</span>
                        <Badge variant="outline">{day.orders} orders</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Products
                </CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.salesTrends.topProducts.map((product, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{product.name}</span>
                        <span className="text-sm">{formatCurrency(product.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{product.sales} sales</span>
                        <Progress value={(product.sales / 250) * 100} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Age Demographics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.customerInsights.demographics.ageGroups.map((group, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{group.range}</span>
                        <span className="text-sm font-medium">{group.percentage}%</span>
                      </div>
                      <Progress value={group.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Behavior */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Customer Behavior
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Session Time</span>
                    <span className="text-sm font-medium">{analyticsData.customerInsights.behavior.averageSessionTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="text-sm font-medium">{analyticsData.customerInsights.behavior.bounceRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Repeat Customers</span>
                    <span className="text-sm font-medium">{analyticsData.customerInsights.behavior.repeatCustomers}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Lifetime Value</span>
                    <span className="text-sm font-medium">{formatCurrency(analyticsData.customerInsights.behavior.customerLifetimeValue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goals & Targets
              </CardTitle>
              <CardDescription>Track progress towards monthly goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.performance.goals.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <span className="text-sm">{goal.current.toLocaleString()} / {goal.target.toLocaleString()}</span>
                    </div>
                    <Progress value={goal.percentage} className="h-3" />
                    <p className="text-xs text-muted-foreground">{goal.percentage.toFixed(1)}% of target achieved</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className="text-2xl font-bold text-green-600">+{analyticsData.performance.kpis.revenueGrowth}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Customer Growth</p>
                <p className="text-2xl font-bold text-blue-600">+{analyticsData.performance.kpis.customerGrowth}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Order Growth</p>
                <p className="text-2xl font-bold text-purple-600">+{analyticsData.performance.kpis.orderGrowth}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold text-orange-600">{analyticsData.performance.kpis.profitMargin}%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Generate Reports
              </CardTitle>
              <CardDescription>Export detailed analytics reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Monthly Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Customer Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  Product Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <DollarSign className="h-6 w-6 mb-2" />
                  Financial Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Growth Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  Performance Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
