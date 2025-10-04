import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, BarChart3, PieChart, Activity, 
  Zap, Download, RefreshCw, Maximize2
} from 'lucide-react';
import ComprehensiveGraphs from '@/components/ComprehensiveGraphs';
import { useGraphData } from '@/hooks/useGraphData';

const GraphsShowcase = () => {
  const [activeDemo, setActiveDemo] = useState('trends');
  
  const { multipleGraphData } = useGraphData();

  const demoSections = [
    {
      id: 'trends',
      title: 'Trend Analysis',
      description: 'Track business performance over time',
      icon: <TrendingUp className="h-5 w-5" />,
      charts: [
        { title: 'Revenue Trends', type: 'line', data: multipleGraphData.revenue },
        { title: 'Sales Growth', type: 'area', data: multipleGraphData.sales },
        { title: 'Customer Acquisition', type: 'line', data: multipleGraphData.customers }
      ]
    },
    {
      id: 'comparisons',
      title: 'Comparative Analysis',
      description: 'Compare different metrics and periods',
      icon: <BarChart3 className="h-5 w-5" />,
      charts: [
        { title: 'Revenue vs Expenses', type: 'bar', data: multipleGraphData.financial },
        { title: 'Product Performance', type: 'bar', data: multipleGraphData.products },
        { title: 'Regional Comparison', type: 'bar', data: multipleGraphData.regions }
      ]
    },
    {
      id: 'distributions',
      title: 'Distribution Analysis',
      description: 'Understand data composition and segments',
      icon: <PieChart className="h-5 w-5" />,
      charts: [
        { title: 'Revenue by Category', type: 'pie', data: multipleGraphData.categories },
        { title: 'Customer Segments', type: 'pie', data: multipleGraphData.segments },
        { title: 'Market Share', type: 'pie', data: multipleGraphData.market }
      ]
    },
    {
      id: 'performance',
      title: 'Performance Metrics',
      description: 'Monitor KPIs and operational efficiency',
      icon: <Activity className="h-5 w-5" />,
      charts: [
        { title: 'KPI Dashboard', type: 'composed', data: multipleGraphData.kpis },
        { title: 'Operational Efficiency', type: 'area', data: multipleGraphData.efficiency },
        { title: 'Quality Metrics', type: 'line', data: multipleGraphData.quality }
      ]
    },
    {
      id: 'realtime',
      title: 'Real-time Analytics',
      description: 'Live data updates and monitoring',
      icon: <Zap className="h-5 w-5" />,
      charts: [
        { title: 'Live Sales', type: 'line', data: multipleGraphData.liveSales, autoRefresh: true },
        { title: 'Active Users', type: 'area', data: multipleGraphData.activeUsers, autoRefresh: true },
        { title: 'System Performance', type: 'composed', data: multipleGraphData.system, autoRefresh: true }
      ]
    }
  ];

  const currentSection = demoSections.find(section => section.id === activeDemo);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Graphs Showcase</h1>
          <p className="text-muted-foreground">
            Comprehensive data visualization and analytics platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            <Activity className="h-3 w-3 mr-1" />
            Interactive Demo
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Platform Features
          </CardTitle>
          <CardDescription>
            Advanced charting capabilities for comprehensive business analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">5 Chart Types</h3>
              <p className="text-sm text-muted-foreground">Line, Area, Bar, Pie, Composed</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">Auto-refresh with live data</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Maximize2 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold">Interactive Controls</h3>
              <p className="text-sm text-muted-foreground">Zoom, filter, export options</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-semibold">Responsive Design</h3>
              <p className="text-sm text-muted-foreground">Works on all devices</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Sections */}
      <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {demoSections.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="flex items-center">
              {section.icon}
              <span className="ml-2 hidden sm:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {demoSections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-6">
            {/* Section Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {section.icon}
                  <span className="ml-2">{section.title}</span>
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {section.charts.map((chart, index) => (
                <ComprehensiveGraphs
                  key={`${section.id}-${index}`}
                  title={chart.title}
                  defaultType={chart.type}
                  data={chart.data}
                  height={300}
                  autoRefresh={chart.autoRefresh || false}
                  refreshInterval={chart.autoRefresh ? 10000 : 30000}
                  showControls={true}
                  exportable={true}
                />
              ))}
            </div>

            {/* Usage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Interactive Features:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Switch between chart types using the dropdown</li>
                      <li>• Adjust time ranges (7D, 30D, 90D, 1Y)</li>
                      <li>• Click refresh to update data manually</li>
                      <li>• Use fullscreen mode for detailed analysis</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Export Options:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Export chart data as JSON</li>
                      <li>• Save charts as images (coming soon)</li>
                      <li>• Generate PDF reports (coming soon)</li>
                      <li>• Share charts via URL (coming soon)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
          <CardDescription>
            See how these charts are integrated across the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Dashboard</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Revenue trends, sales performance, and customer growth metrics
              </p>
              <Badge variant="outline">Live Updates</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Analytics</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Detailed analysis with multiple chart types and comparisons
              </p>
              <Badge variant="outline">Interactive</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Finances</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Financial analytics with profit/loss and expense tracking
              </p>
              <Badge variant="outline">Real-time</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraphsShowcase;
