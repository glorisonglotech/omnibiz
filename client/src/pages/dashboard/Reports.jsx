import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Users, 
  ShoppingCart, 
  DollarSign,
  FileText,
  TrendingUp,
  Filter,
  RefreshCw,
  Mail,
  Clock,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import ActivityHistory from '@/components/ActivityHistory';
import OrderHistory from '@/components/OrderHistory';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    overview: {},
    trends: {},
    analytics: {}
  });
  
  const [filters, setFilters] = useState({
    timeframe: '30d',
    reportType: 'overview',
    dateRange: null
  });

  const [availableReports, setAvailableReports] = useState([]);

  useEffect(() => {
    fetchReportData();
    loadAvailableReports();
  }, [filters.timeframe]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, analyticsResponse] = await Promise.all([
        api.get(`/dashboard?timeframe=${filters.timeframe}`),
        api.get(`/dashboard/analytics/orders?timeframe=${filters.timeframe}`)
      ]);

      setReportData({
        overview: dashboardResponse.data.data,
        analytics: analyticsResponse.data.data
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableReports = () => {
    const reports = [
      {
        id: 'sales-summary',
        name: 'Sales Summary Report',
        description: 'Comprehensive sales performance and revenue analysis',
        icon: DollarSign,
        category: 'Financial',
        permissions: ['canViewReports']
      },
      {
        id: 'order-analysis',
        name: 'Order Analysis Report',
        description: 'Detailed order trends, status breakdown, and customer insights',
        icon: ShoppingCart,
        category: 'Operations',
        permissions: ['canViewAllOrders']
      },
      {
        id: 'customer-insights',
        name: 'Customer Insights Report',
        description: 'Customer behavior, demographics, and engagement metrics',
        icon: Users,
        category: 'Marketing',
        permissions: ['canViewAllClients']
      },
      {
        id: 'activity-audit',
        name: 'Activity Audit Report',
        description: 'User activity logs, security events, and system usage',
        icon: FileText,
        category: 'Security',
        permissions: ['canViewReports']
      },
      {
        id: 'performance-metrics',
        name: 'Performance Metrics Report',
        description: 'System performance, response times, and efficiency metrics',
        icon: TrendingUp,
        category: 'Technical',
        permissions: ['canManageSettings']
      }
    ];

    // Filter reports based on user permissions
    const userPermissions = user.permissions || {};
    const filteredReports = reports.filter(report => 
      report.permissions.some(permission => userPermissions[permission])
    );

    setAvailableReports(filteredReports);
  };

  const handleGenerateReport = async (reportId) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('reportType', reportId);
      params.append('timeframe', filters.timeframe);
      if (filters.dateRange?.from) params.append('startDate', filters.dateRange.from.toISOString());
      if (filters.dateRange?.to) params.append('endDate', filters.dateRange.to.toISOString());

      const response = await api.post('/reports/generate', {
        reportType: reportId,
        timeframe: filters.timeframe,
        dateRange: filters.dateRange,
        format: 'pdf'
      });

      // Handle report download
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      } else {
        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format = 'csv') => {
    try {
      const response = await api.post('/reports/export', {
        format,
        timeframe: filters.timeframe,
        dateRange: filters.dateRange,
        includeCharts: format === 'pdf'
      });

      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omnibiz-report-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleScheduleReport = async (reportId, schedule) => {
    try {
      await api.post('/reports/schedule', {
        reportId,
        schedule, // 'daily', 'weekly', 'monthly'
        recipients: [user.email],
        format: 'pdf'
      });

      toast.success(`Report scheduled to be sent ${schedule}`);
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Failed to schedule report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const timeframeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Generate comprehensive reports and analyze business performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchReportData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleExportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select 
                value={filters.timeframe} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, timeframe: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Custom Date Range</label>
              <DatePickerWithRange
                date={filters.dateRange}
                setDate={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={fetchReportData} 
                className="w-full"
                disabled={loading}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Update Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.overview?.totalRevenue || 0)}
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        +{reportData.overview?.growthRates?.revenue || 0}%
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(reportData.overview?.totalOrders || 0)}
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        +{reportData.overview?.growthRates?.orders || 0}%
                      </span>
                    </div>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatNumber(reportData.overview?.totalUsers || 0)}
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        +{reportData.overview?.growthRates?.users || 0}%
                      </span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Requests</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatNumber(reportData.overview?.activeServiceRequests || 0)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Service requests</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Report Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleExportData('pdf')}
                >
                  <Download className="h-6 w-6 mb-2" />
                  <span className="text-sm">Export PDF Report</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleExportData('csv')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Export Data CSV</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleScheduleReport('overview', 'weekly')}
                >
                  <Mail className="h-6 w-6 mb-2" />
                  <span className="text-sm">Schedule Weekly Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableReports.map((report) => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-blue-600" />
                      <Badge variant="outline">{report.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleScheduleReport(report.id, 'monthly')}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <OrderHistory showFilters={true} limit={20} />
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <ActivityHistory showFilters={true} limit={20} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Advanced analytics charts and visualizations will be displayed here.</p>
                <p className="text-sm mt-2">Integration with charting libraries like Chart.js or D3.js recommended.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
