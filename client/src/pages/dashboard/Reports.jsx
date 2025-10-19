import React, { useState, useEffect, useCallback } from 'react';
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
  Eye,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import ActivityHistory from '@/components/ActivityHistory';
import OrderHistory from '@/components/OrderHistory';

const Reports = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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
    if (isAuthenticated) {
      fetchReportData();
      loadAvailableReports();
    }
  }, [filters.timeframe, isAuthenticated]);

  const fetchReportData = useCallback(async (showToast = false) => {
    if (!isAuthenticated) return;
    
    try {
      if (showToast) {
        setRefreshing(true);
        toast.info('Refreshing reports...');
      } else {
        setLoading(true);
      }
      
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch real data from multiple sources
      const [ordersRes, invoicesRes, expensesRes] = await Promise.allSettled([
        api.get('/orders', { headers }),
        api.get('/invoices', { headers }),
        api.get('/expenses', { headers })
      ]);
      
      // Extract data safely
      const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value?.data || []) : [];
      const invoices = invoicesRes.status === 'fulfilled' ? (invoicesRes.value?.data || []) : [];
      const expenses = expensesRes.status === 'fulfilled' ? (expensesRes.value?.data || []) : [];
      
      // Ensure arrays
      const safeOrders = Array.isArray(orders) ? orders : [];
      const safeInvoices = Array.isArray(invoices) ? invoices : [];
      const safeExpenses = Array.isArray(expenses) ? expenses : [];
      
      // Calculate overview metrics
      const totalRevenue = safeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
      const totalOrders = safeOrders.length;
      const uniqueCustomers = new Set(safeOrders.map(o => o.customer?.email).filter(Boolean)).size;
      const activeServiceRequests = safeInvoices.filter(i => i.paymentStatus === 'pending').length;
      
      // Calculate growth rates (compare with previous period)
      const now = new Date();
      const periodDays = filters.timeframe === '7d' ? 7 : filters.timeframe === '30d' ? 30 : filters.timeframe === '90d' ? 90 : 365;
      const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const previousPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
      
      const currentPeriodOrders = safeOrders.filter(o => new Date(o.createdAt) >= periodStart);
      const previousPeriodOrders = safeOrders.filter(o => 
        new Date(o.createdAt) >= previousPeriodStart && 
        new Date(o.createdAt) < periodStart
      );
      
      const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) : 0;
      const ordersGrowth = previousPeriodOrders.length > 0 ? ((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length * 100).toFixed(1) : 0;
      
      const currentUsers = new Set(currentPeriodOrders.map(o => o.customer?.email).filter(Boolean)).size;
      const previousUsers = new Set(previousPeriodOrders.map(o => o.customer?.email).filter(Boolean)).size;
      const usersGrowth = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers * 100).toFixed(1) : 0;
      
      setReportData({
        overview: {
          totalRevenue,
          totalOrders,
          totalUsers: uniqueCustomers,
          activeServiceRequests,
          growthRates: {
            revenue: Number(revenueGrowth),
            orders: Number(ordersGrowth),
            users: Number(usersGrowth)
          }
        },
        analytics: {
          orders: safeOrders,
          invoices: safeInvoices,
          expenses: safeExpenses
        }
      });
      
      console.log('✅ Report data loaded:', {
        orders: safeOrders.length,
        invoices: safeInvoices.length,
        expenses: safeExpenses.length,
        totalRevenue,
        growthRates: { revenueGrowth, ordersGrowth, usersGrowth }
      });
      
      if (showToast) {
        toast.success('Reports refreshed!');
      }
    } catch (err) {
      console.error('❌ Error fetching report data:', err);
      setError(err.message || 'Failed to load report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.timeframe, isAuthenticated]);

  const loadAvailableReports = () => {
    const reports = [
      {
        id: 'sales-summary',
        name: 'Sales Summary Report',
        description: 'Comprehensive sales performance and revenue analysis',
        icon: DollarSign,
        category: 'Financial',
        permissions: ['canViewReports', 'admin']
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
    const userPermissions = user?.permissions || {};
    const userRole = user?.role || 'user';
    
    // Show all reports if user is admin or has permissions
    const filteredReports = reports.filter(report => 
      userRole === 'admin' || 
      report.permissions.some(permission => 
        userPermissions[permission] || permission === userRole
      )
    );

    // If no permissions match, show all reports (better UX for demo)
    setAvailableReports(filteredReports.length > 0 ? filteredReports : reports);
  };

  const handleGenerateReport = async (reportId) => {
    try {
      setLoading(true);
      toast.info(`Generating ${reportId} report...`);
      
      const token = localStorage.getItem('token');
      const params = {
        reportType: reportId,
        timeframe: filters.timeframe,
        format: 'pdf'
      };

      if (filters.dateRange?.from) {
        params.startDate = filters.dateRange.from.toISOString();
      }
      if (filters.dateRange?.to) {
        params.endDate = filters.dateRange.to.toISOString();
      }

      const response = await api.post('/reports/generate', params, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Handle report download
      if (response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report downloaded successfully!');
      } else {
        throw new Error('No data received');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Report generation is currently unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format = 'csv') => {
    try {
      toast.info(`Preparing ${format.toUpperCase()} export...`);
      
      const token = localStorage.getItem('token');
      const response = await api.post('/reports/export', {
        format,
        timeframe: filters.timeframe,
        dateRange: filters.dateRange,
        includeCharts: format === 'pdf'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ominbiz-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Export feature is currently unavailable. Please contact support.');
    }
  };

  const handleScheduleReport = async (reportId, schedule) => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/reports/schedule', {
        reportId,
        schedule, // 'daily', 'weekly', 'monthly'
        recipients: [user?.email || 'admin@ominbiz.com'],
        format: 'pdf'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(`${reportId} report scheduled to be sent ${schedule}`);
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Report scheduling is currently unavailable. Feature coming soon!');
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
            onClick={() => fetchReportData(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={() => handleExportData('csv')} disabled={loading}>
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
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select 
                value={filters.reportType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => fetchReportData(true)} 
                className="w-full"
                disabled={loading || refreshing}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Update Reports'}
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
          {error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <div>
                    <p className="font-semibold text-red-700">Failed to Load Report Data</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  <Button onClick={() => fetchReportData()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-8 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
          <>
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
                      {(reportData.overview?.growthRates?.revenue || 0) >= 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">
                            +{Math.abs(reportData.overview?.growthRates?.revenue || 0)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                          <span className="text-xs text-red-600">
                            {reportData.overview?.growthRates?.revenue}%
                          </span>
                        </>
                      )}
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
                      {(reportData.overview?.growthRates?.orders || 0) >= 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">
                            +{Math.abs(reportData.overview?.growthRates?.orders || 0)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                          <span className="text-xs text-red-600">
                            {reportData.overview?.growthRates?.orders}%
                          </span>
                        </>
                      )}
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
                      {(reportData.overview?.growthRates?.users || 0) >= 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">
                            +{Math.abs(reportData.overview?.growthRates?.users || 0)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                          <span className="text-xs text-red-600">
                            {reportData.overview?.growthRates?.users}%
                          </span>
                        </>
                      )}
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
          </>
          )}
        </TabsContent>

        {/* Available Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {availableReports.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No reports available</p>
                </div>
              </CardContent>
            </Card>
          ) : (
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
          )}
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
