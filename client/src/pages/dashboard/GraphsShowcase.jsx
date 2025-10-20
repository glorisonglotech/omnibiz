import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import ComprehensiveGraphs from '@/components/ComprehensiveGraphs';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

const GraphsShowcase = () => {
  const { socket, connected } = useSocket();
  const { isAuthenticated } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [realData, setRealData] = useState({
    revenue: [],
    sales: [],
    categories: [],
    traffic: [],
    performance: []
  });

  // Fetch real data from API
  useEffect(() => {
    const fetchRealData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [ordersRes, productsRes] = await Promise.all([
          api.get("/orders", { headers }).catch(() => ({ data: [] })),
          api.get("/products", { headers }).catch(() => ({ data: [] }))
        ]);
        
        const orders = ordersRes.data || [];
        const products = productsRes.data || [];
        
        // Generate real data from orders
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayOrders = orders.filter(o => {
            const orderDate = new Date(o.date || o.createdAt);
            return orderDate.toDateString() === date.toDateString();
          });
          last30Days.push({
            name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
            orders: dayOrders.length
          });
        }
        
        // Category breakdown from products
        const categories = {};
        products.forEach(p => {
          const cat = p.category || 'Other';
          categories[cat] = (categories[cat] || 0) + (p.price * (p.stockQuantity || 0));
        });
        const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));
        
        // Traffic sources from orders
        const sources = { 'Online': 0, 'Walk-in': 0, 'Mobile': 0 };
        orders.forEach(o => {
          const src = o.source || 'Online';
          sources[src] = (sources[src] || 0) + 1;
        });
        const trafficData = Object.entries(sources).map(([name, value]) => ({ name, value }));
        
        // Performance from order status
        const statuses = {};
        orders.forEach(o => {
          const status = o.status || 'Pending';
          statuses[status] = (statuses[status] || 0) + 1;
        });
        const performanceData = Object.entries(statuses).map(([name, value]) => ({ name, value }));
        
        setRealData({
          revenue: last30Days,
          sales: last30Days,
          categories: categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }],
          traffic: trafficData,
          performance: performanceData.length > 0 ? performanceData : [{ name: 'No Data', value: 1 }]
        });
        
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealData();
  }, [isAuthenticated, refreshKey]);

  const refreshAllGraphs = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('All graphs refreshed successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-green-600" />
            Real-Time Business Analytics
          </h1>
          <p className="text-muted-foreground">
            Live data from your business operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={connected ? "default" : "secondary"}>
            {connected ? "● Live" : "Offline"}
          </Badge>
          <Button onClick={refreshAllGraphs} className="gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold">Real-time Updates</p>
                <p className="text-xs text-muted-foreground">Auto-refresh capabilities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold">Interactive Controls</p>
                <p className="text-xs text-muted-foreground">Chart type switching</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold">Export Ready</p>
                <p className="text-xs text-muted-foreground">CSV data export</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-semibold">Multiple Types</p>
                <p className="text-xs text-muted-foreground">Line, Bar, Pie, Area</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          <TabsTrigger value="distributions">Distributions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComprehensiveGraphs
              key={`trend-1-${refreshKey}`}
              title="Revenue Growth Trends"
              description={`Last 30 days - KES ${realData.revenue.reduce((sum, d) => sum + d.value, 0).toLocaleString()}`}
              type="area"
              data={realData.revenue}
              height={350}
            />
            
            <ComprehensiveGraphs
              key={`trend-2-${refreshKey}`}
              title="Daily Sales Performance"
              description={`${realData.sales.reduce((sum, d) => sum + d.orders, 0)} total orders`}
              type="line"
              data={realData.sales}
              height={350}
            />
          </div>
          
          <ComprehensiveGraphs
            key={`trend-3-${refreshKey}`}
            title="Sales Performance Timeline"
            description="Real-time sales data with order metrics"
            type="composed"
            data={realData.sales}
            height={400}
          />
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComprehensiveGraphs
              key={`comp-1-${refreshKey}`}
              title="Daily Revenue Comparison"
              description="Day-by-day performance analysis"
              type="bar"
              data={realData.revenue}
              height={350}
            />
            
            <ComprehensiveGraphs
              key={`comp-2-${refreshKey}`}
              title="Product Category Performance"
              description={`${realData.categories.length} categories`}
              type="bar"
              data={realData.categories}
              height={350}
              showControls={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="distributions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ComprehensiveGraphs
              key={`dist-1-${refreshKey}`}
              title="Order Sources"
              description="Order source distribution"
              type="pie"
              data={realData.traffic}
              height={300}
              showControls={false}
            />
            
            <ComprehensiveGraphs
              key={`dist-2-${refreshKey}`}
              title="Product Categories"
              description="Sales by product category"
              type="pie"
              data={realData.categories}
              height={300}
              showControls={false}
            />
            
            <ComprehensiveGraphs
              key={`dist-3-${refreshKey}`}
              title="Order Status"
              description="Current order distribution"
              type="pie"
              data={realData.performance}
              height={300}
              showControls={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComprehensiveGraphs
              key={`perf-1-${refreshKey}`}
              title="Sales KPI Dashboard"
              description="Real-time sales performance"
              type="composed"
              data={realData.sales}
              height={350}
            />
            
            <ComprehensiveGraphs
              key={`perf-2-${refreshKey}`}
              title="Revenue Efficiency"
              description="Revenue generation over time"
              type="area"
              data={realData.revenue}
              height={350}
            />
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComprehensiveGraphs
              key={`rt-1-${refreshKey}`}
              title="Live Sales Data"
              description="Last 7 days real-time sales"
              type="line"
              data={realData.sales.slice(-7)}
              height={350}
              autoRefresh={true}
              refreshInterval={30000}
            />
            
            <ComprehensiveGraphs
              key={`rt-2-${refreshKey}`}
              title="Revenue Tracking"
              description="Real-time revenue monitoring"
              type="area"
              data={realData.revenue.slice(-7)}
              height={350}
              autoRefresh={true}
              refreshInterval={30000}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ComprehensiveGraphs
              key={`rt-3-${refreshKey}`}
              title="Recent Activity"
              description="Last 10 days"
              type="line"
              data={realData.sales.slice(-10)}
              height={250}
              autoRefresh={true}
              refreshInterval={30000}
            />
            
            <ComprehensiveGraphs
              key={`rt-4-${refreshKey}`}
              title="Category Distribution"
              description="Live category breakdown"
              type="bar"
              data={realData.categories.slice(0, 5)}
              height={250}
              autoRefresh={true}
              refreshInterval={60000}
            />
            
            <ComprehensiveGraphs
              key={`rt-5-${refreshKey}`}
              title="Order Status"
              description="Current order status"
              type="pie"
              data={realData.performance}
              height={250}
              autoRefresh={true}
              refreshInterval={30000}
              showControls={false}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Comprehensive Graphs</CardTitle>
          <CardDescription>
            Interactive features and customization options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Interactive Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Switch between chart types (Line, Bar, Area, Pie)</li>
                <li>• Adjust time ranges (7d, 30d, 90d, 1y)</li>
                <li>• Real-time data refresh capabilities</li>
                <li>• Export data to CSV format</li>
                <li>• Hover tooltips for detailed information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Customization Options</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Custom color schemes for different data types</li>
                <li>• Configurable auto-refresh intervals</li>
                <li>• Responsive design for all screen sizes</li>
                <li>• Data transformation and filtering</li>
                <li>• Integration with existing API endpoints</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraphsShowcase;
