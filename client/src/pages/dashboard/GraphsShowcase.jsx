import React, { useState } from 'react';
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
import { generateMockGraphData } from '@/hooks/useGraphData';
import { toast } from 'sonner';

const GraphsShowcase = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshAllGraphs = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('All graphs refreshed successfully!');
  };

  // Sample data for different chart types
  const pieData = [
    { name: 'Desktop', value: 45 },
    { name: 'Mobile', value: 35 },
    { name: 'Tablet', value: 20 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 35 },
    { name: 'Clothing', value: 25 },
    { name: 'Books', value: 20 },
    { name: 'Home & Garden', value: 15 },
    { name: 'Sports', value: 5 }
  ];

  const performanceData = [
    { name: 'Excellent', value: 40 },
    { name: 'Good', value: 35 },
    { name: 'Average', value: 20 },
    { name: 'Poor', value: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-green-600" />
            Comprehensive Graphs Showcase
          </h1>
          <p className="text-muted-foreground">
            Interactive charts and analytics for business insights
          </p>
        </div>
        <Button onClick={refreshAllGraphs} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh All
        </Button>
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
              description="Monthly revenue progression with growth indicators"
              type="area"
              data={generateMockGraphData('growth', 12)}
              height={350}
            />
            
            <ComprehensiveGraphs
              key={`trend-2-${refreshKey}`}
              title="Customer Acquisition"
              description="New customer trends over time"
              type="line"
              data={generateMockGraphData('trend', 30)}
              height={350}
            />
          </div>
          
          <ComprehensiveGraphs
            key={`trend-3-${refreshKey}`}
            title="Sales Performance Timeline"
            description="Comprehensive sales data with multiple metrics"
            type="composed"
            data={generateMockGraphData('growth', 30)}
            height={400}
          />
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComprehensiveGraphs
              key={`comp-1-${refreshKey}`}
              title="Monthly Comparisons"
              description="Month-over-month performance analysis"
              type="bar"
              data={generateMockGraphData('trend', 12)}
              height={350}
            />
            
            <ComprehensiveGraphs
              key={`comp-2-${refreshKey}`}
              title="Product Performance"
              description="Comparative analysis of product categories"
              type="bar"
              data={categoryData}
              height={350}
              showControls={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="distributions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ComprehensiveGraphs
              key={`dist-1-${refreshKey}`}
              title="Traffic Sources"
              description="Website traffic distribution"
              type="pie"
              data={pieData}
              height={300}
              showControls={false}
            />
            
            <ComprehensiveGraphs
              key={`dist-2-${refreshKey}`}
              title="Product Categories"
              description="Sales by product category"
              type="pie"
              data={categoryData}
              height={300}
              showControls={false}
            />
            
            <ComprehensiveGraphs
              key={`dist-3-${refreshKey}`}
              title="Performance Ratings"
              description="Customer satisfaction distribution"
              type="pie"
              data={performanceData}
              height={300}
              showControls={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComprehensiveGraphs
              key={`perf-1-${refreshKey}`}
              title="KPI Dashboard"
              description="Key performance indicators tracking"
              type="composed"
              data={generateMockGraphData('growth', 20)}
              height={350}
            />
            
            <ComprehensiveGraphs
              key={`perf-2-${refreshKey}`}
              title="Efficiency Metrics"
              description="Operational efficiency over time"
              type="area"
              data={generateMockGraphData('trend', 30)}
              height={350}
            />
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComprehensiveGraphs
              key={`rt-1-${refreshKey}`}
              title="Live Sales Data"
              description="Real-time sales monitoring"
              type="line"
              data={generateMockGraphData('trend', 24)}
              height={350}
              autoRefresh={true}
              refreshInterval={5000}
            />
            
            <ComprehensiveGraphs
              key={`rt-2-${refreshKey}`}
              title="Active Users"
              description="Current active user count"
              type="area"
              data={generateMockGraphData('trend', 24)}
              height={350}
              autoRefresh={true}
              refreshInterval={3000}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ComprehensiveGraphs
              key={`rt-3-${refreshKey}`}
              title="Server Performance"
              description="Real-time server metrics"
              type="line"
              data={generateMockGraphData('trend', 20)}
              height={250}
              autoRefresh={true}
              refreshInterval={2000}
            />
            
            <ComprehensiveGraphs
              key={`rt-4-${refreshKey}`}
              title="Order Processing"
              description="Live order processing rate"
              type="bar"
              data={generateMockGraphData('trend', 10)}
              height={250}
              autoRefresh={true}
              refreshInterval={4000}
            />
            
            <ComprehensiveGraphs
              key={`rt-5-${refreshKey}`}
              title="System Health"
              description="Overall system status"
              type="pie"
              data={[
                { name: 'Healthy', value: 85 },
                { name: 'Warning', value: 12 },
                { name: 'Critical', value: 3 }
              ]}
              height={250}
              autoRefresh={true}
              refreshInterval={10000}
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
