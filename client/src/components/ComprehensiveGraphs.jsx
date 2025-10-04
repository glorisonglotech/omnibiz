import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, Activity, Download, RefreshCw, 
  Calendar, Filter, Maximize2, Minimize2
} from 'lucide-react';
import { useGraphData } from '@/hooks/useGraphData';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ComprehensiveGraphs = ({ 
  title = "Business Analytics", 
  showControls = true,
  defaultType = "line",
  height = 400,
  data = null,
  autoRefresh = true,
  refreshInterval = 30000,
  exportable = true,
  fullscreen = false,
  onFullscreenToggle = null
}) => {
  const [chartType, setChartType] = useState(defaultType);
  const [timeRange, setTimeRange] = useState('30d');
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);

  const { 
    graphData, 
    loading, 
    error, 
    refreshData,
    multipleGraphData,
    generateInsights
  } = useGraphData({
    type: chartType,
    timeRange,
    autoRefresh,
    refreshInterval
  });

  const chartData = data || graphData;

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(chartData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_data_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const toggleFullscreen = () => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    if (onFullscreenToggle) {
      onFullscreenToggle(newFullscreen);
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading chart data...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-red-500">
          <Activity className="h-8 w-8 mr-2" />
          <span>Error loading chart: {error}</span>
        </div>
      );
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <BarChart3 className="h-8 w-8 mr-2" />
          <span>No data available</span>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="value2" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stackId="1" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="value2" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
            <Bar dataKey="value2" fill="#82ca9d" />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value2" fill="#8884d8" stroke="#8884d8" />
            <Bar dataKey="value" barSize={20} fill="#413ea0" />
            <Line type="monotone" dataKey="profit" stroke="#ff7300" />
          </ComposedChart>
        );

      default:
        return renderChart();
    }
  };

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 m-4' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>
            Interactive business analytics and insights
          </CardDescription>
        </div>
        
        {showControls && (
          <div className="flex items-center space-x-2">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">
                  <div className="flex items-center">
                    <LineChartIcon className="h-4 w-4 mr-2" />
                    Line
                  </div>
                </SelectItem>
                <SelectItem value="area">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Area
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Bar
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center">
                    <PieChartIcon className="h-4 w-4 mr-2" />
                    Pie
                  </div>
                </SelectItem>
                <SelectItem value="composed">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Mixed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
                <SelectItem value="90d">90D</SelectItem>
                <SelectItem value="1y">1Y</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            {exportable && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {chartData && chartData.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Calendar className="h-3 w-3 mr-1" />
              {chartData.length} data points
            </Badge>
            <Badge variant="secondary">
              <TrendingUp className="h-3 w-3 mr-1" />
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
            </Badge>
            {autoRefresh && (
              <Badge variant="outline">
                <RefreshCw className="h-3 w-3 mr-1" />
                Auto-refresh: {refreshInterval / 1000}s
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComprehensiveGraphs;
