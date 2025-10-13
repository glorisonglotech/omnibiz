import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const ComprehensiveGraphs = ({ 
  data = null, 
  type = 'line', 
  title = 'Analytics Chart',
  description = '',
  height = 300,
  showControls = true,
  autoRefresh = false,
  refreshInterval = 30000,
  className = '',
  onDataUpdate = null
}) => {
  const [chartType, setChartType] = useState(type);
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState(data);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Color schemes for different chart types
  const colorSchemes = {
    primary: ['#10b981', '#059669', '#047857', '#065f46'],
    profit: ['#22c55e', '#16a34a', '#15803d', '#166534'],
    loss: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
    neutral: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
    rainbow: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
  };

  // Generate mock data if none provided
  const generateMockData = (type, range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      const baseValue = 1000 + Math.random() * 500;
      const trend = type === 'profit' ? i * 10 : type === 'loss' ? -i * 5 : Math.sin(i / 5) * 100;
      
      data.push({
        date: date.toISOString().split('T')[0],
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(0, baseValue + trend + (Math.random() - 0.5) * 200),
        profit: Math.max(0, baseValue * 0.3 + trend * 0.5 + (Math.random() - 0.5) * 100),
        loss: Math.max(0, baseValue * 0.1 - trend * 0.3 + (Math.random() - 0.5) * 50),
        revenue: baseValue + trend + (Math.random() - 0.5) * 300,
        orders: Math.floor(20 + Math.random() * 50 + i * 2),
        customers: Math.floor(10 + Math.random() * 30 + i),
        products: Math.floor(5 + Math.random() * 15),
        growth: ((Math.random() - 0.5) * 20).toFixed(1)
      });
    }
    
    return data;
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, timeRange]);

  // Initialize data
  useEffect(() => {
    if (!data) {
      setChartData(generateMockData(type, timeRange));
    } else {
      setChartData(data);
    }
  }, [data, type, timeRange]);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newData = data || generateMockData(type, timeRange);
      setChartData(newData);
      setLastUpdated(new Date());
      
      if (onDataUpdate) {
        onDataUpdate(newData);
      }
      
      toast.success('Chart data updated successfully');
    } catch (error) {
      toast.error('Failed to update chart data');
    } finally {
      setLoading(false);
    }
  };

  const exportChart = () => {
    toast.info('Exporting chart data...');
    // Implement export functionality
    const csvData = chartData.map(item => 
      Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(', ')
    ).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getColorScheme = () => {
    if (title.toLowerCase().includes('profit') || title.toLowerCase().includes('revenue')) {
      return colorSchemes.profit;
    }
    if (title.toLowerCase().includes('loss') || title.toLowerCase().includes('expense')) {
      return colorSchemes.loss;
    }
    return colorSchemes.primary;
  };

  const colors = getColorScheme();

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No data available</p>
          </div>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              fill={colors[0]}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'pie':
        const pieData = chartData.slice(0, 6).map((item, index) => ({
          name: item.name,
          value: item.value,
          fill: colorSchemes.rainbow[index % colorSchemes.rainbow.length]
        }));
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend />
            <Bar dataKey="profit" fill={colorSchemes.profit[0]} radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="revenue" stroke={colors[0]} strokeWidth={3} />
          </ComposedChart>
        );

      default:
        return renderChart();
    }
  };

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: Activity },
    { value: 'area', label: 'Area Chart', icon: TrendingUp },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
    { value: 'composed', label: 'Combined', icon: BarChart3 }
  ];

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              {title}
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportChart}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last updated: {lastUpdated.toLocaleTimeString()}
            {autoRefresh && (
              <Badge variant="secondary" className="text-xs">
                Auto-refresh
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveGraphs;
