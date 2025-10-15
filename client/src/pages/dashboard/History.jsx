import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  History as HistoryIcon, 
  Activity, 
  Users, 
  ShoppingCart, 
  DollarSign,
  FileText,
  Settings,
  Download,
  Filter,
  TrendingUp,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ActivityHistory from '@/components/ActivityHistory';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import api from '@/lib/api';

const History = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activityStats, setActivityStats] = useState([
    {
      title: "Total Activities",
      value: "0",
      change: "0%",
      trend: "up",
      icon: Activity,
      description: "from last month"
    },
    {
      title: "User Actions",
      value: "0",
      change: "0%",
      trend: "up",
      icon: Users,
      description: "from last month"
    },
    {
      title: "System Events",
      value: "0",
      change: "0%",
      trend: "up",
      icon: Settings,
      description: "from last month"
    },
    {
      title: "Critical Events",
      value: "0",
      change: "0%",
      trend: "down",
      icon: FileText,
      description: "from last month"
    }
  ]);

  const fetchActivityStats = useCallback(async (showToast = false) => {
    if (!isAuthenticated) return;
    
    try {
      if (showToast) {
        setRefreshing(true);
        toast.info('Refreshing activity data...');
      } else {
        setLoading(true);
      }
      
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch all activity data
      const [ordersRes, invoicesRes, expensesRes, transactionsRes] = await Promise.all([
        api.get('/orders', { headers }).catch(() => ({ data: [] })),
        api.get('/invoices', { headers }).catch(() => ({ data: [] })),
        api.get('/expenses', { headers }).catch(() => ({ data: [] })),
        api.get('/transactions', { headers }).catch(() => ({ data: [] }))
      ]);
      
      // Ensure all data is an array
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
      const expenses = Array.isArray(expensesRes.data) ? expensesRes.data : [];
      const transactions = Array.isArray(transactionsRes.data) ? transactionsRes.data : [];
      
      console.log('📊 Fetched data:', {
        orders: orders.length,
        invoices: invoices.length,
        expenses: expenses.length,
        transactions: transactions.length
      });
      
      // Calculate activity counts
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Total activities (all combined) - with safe filtering
      const totalCurrent = (orders?.filter(o => o.createdAt && new Date(o.createdAt) >= currentMonth) || []).length +
                          (invoices?.filter(i => i.createdAt && new Date(i.createdAt) >= currentMonth) || []).length +
                          (expenses?.filter(e => e.createdAt && new Date(e.createdAt) >= currentMonth) || []).length +
                          (transactions?.filter(t => t.createdAt && new Date(t.createdAt) >= currentMonth) || []).length;
      
      const totalLast = (orders?.filter(o => o.createdAt && new Date(o.createdAt) >= lastMonth && new Date(o.createdAt) < currentMonth) || []).length +
                       (invoices?.filter(i => i.createdAt && new Date(i.createdAt) >= lastMonth && new Date(i.createdAt) < currentMonth) || []).length +
                       (expenses?.filter(e => e.createdAt && new Date(e.createdAt) >= lastMonth && new Date(e.createdAt) < currentMonth) || []).length +
                       (transactions?.filter(t => t.createdAt && new Date(t.createdAt) >= lastMonth && new Date(t.createdAt) < currentMonth) || []).length;
      
      const totalGrowth = totalLast > 0 ? ((totalCurrent - totalLast) / totalLast * 100).toFixed(1) : 0;
      
      // User actions (orders + invoices) - with safe filtering
      const userCurrent = (orders?.filter(o => o.createdAt && new Date(o.createdAt) >= currentMonth) || []).length +
                         (invoices?.filter(i => i.createdAt && new Date(i.createdAt) >= currentMonth) || []).length;
      
      const userLast = (orders?.filter(o => o.createdAt && new Date(o.createdAt) >= lastMonth && new Date(o.createdAt) < currentMonth) || []).length +
                      (invoices?.filter(i => i.createdAt && new Date(i.createdAt) >= lastMonth && new Date(i.createdAt) < currentMonth) || []).length;
      
      const userGrowth = userLast > 0 ? ((userCurrent - userLast) / userLast * 100).toFixed(1) : 0;
      
      // System events (transactions + expenses) - with safe filtering
      const systemCurrent = (transactions?.filter(t => t.createdAt && new Date(t.createdAt) >= currentMonth) || []).length +
                           (expenses?.filter(e => e.createdAt && new Date(e.createdAt) >= currentMonth) || []).length;
      
      const systemLast = (transactions?.filter(t => t.createdAt && new Date(t.createdAt) >= lastMonth && new Date(t.createdAt) < currentMonth) || []).length +
                        (expenses?.filter(e => e.createdAt && new Date(e.createdAt) >= lastMonth && new Date(e.createdAt) < currentMonth) || []).length;
      
      const systemGrowth = systemLast > 0 ? ((systemCurrent - systemLast) / systemLast * 100).toFixed(1) : 0;
      
      // Critical events (failed transactions + overdue invoices) - with safe filtering
      const criticalCurrent = (transactions?.filter(t => 
        t.createdAt && new Date(t.createdAt) >= currentMonth && 
        (t.status === 'failed' || t.status === 'error')
      ) || []).length + (invoices?.filter(i => 
        i.createdAt && new Date(i.createdAt) >= currentMonth && 
        i.paymentStatus === 'overdue'
      ) || []).length;
      
      const criticalLast = (transactions?.filter(t => 
        t.createdAt && new Date(t.createdAt) >= lastMonth && 
        new Date(t.createdAt) < currentMonth &&
        (t.status === 'failed' || t.status === 'error')
      ) || []).length + (invoices?.filter(i => 
        i.createdAt && new Date(i.createdAt) >= lastMonth && 
        new Date(i.createdAt) < currentMonth &&
        i.paymentStatus === 'overdue'
      ) || []).length;
      
      const criticalGrowth = criticalLast > 0 ? ((criticalCurrent - criticalLast) / criticalLast * 100).toFixed(1) : 0;
      
      // Update stats
      setActivityStats([
        {
          title: "Total Activities",
          value: totalCurrent.toLocaleString(),
          change: `${totalGrowth >= 0 ? '+' : ''}${totalGrowth}%`,
          trend: totalGrowth >= 0 ? "up" : "down",
          icon: Activity,
          description: "from last month"
        },
        {
          title: "User Actions",
          value: userCurrent.toLocaleString(),
          change: `${userGrowth >= 0 ? '+' : ''}${userGrowth}%`,
          trend: userGrowth >= 0 ? "up" : "down",
          icon: Users,
          description: "from last month"
        },
        {
          title: "System Events",
          value: systemCurrent.toLocaleString(),
          change: `${systemGrowth >= 0 ? '+' : ''}${systemGrowth}%`,
          trend: systemGrowth >= 0 ? "up" : "down",
          icon: Settings,
          description: "from last month"
        },
        {
          title: "Critical Events",
          value: criticalCurrent.toLocaleString(),
          change: `${criticalGrowth >= 0 ? '+' : ''}${criticalGrowth}%`,
          trend: criticalGrowth >= 0 ? "up" : "down",
          icon: FileText,
          description: "from last month"
        }
      ]);
      
      console.log('✅ Activity stats loaded:', {
        total: totalCurrent,
        user: userCurrent,
        system: systemCurrent,
        critical: criticalCurrent
      });
      
      if (showToast) {
        toast.success('Activity data refreshed!');
      }
    } catch (err) {
      console.error('❌ Error fetching activity stats:', err);
      setError(err.message || 'Failed to load activity data');
      if (showToast) {
        toast.error('Failed to refresh activity data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchActivityStats();
      
      // Auto-refresh every 3 minutes
      const interval = setInterval(() => fetchActivityStats(), 180000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchActivityStats]);

  const handleExportHistory = async () => {
    try {
      setExportLoading(true);
      const response = await fetch('/api/activities/export?format=csv', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-history-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('History exported successfully!');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast.error('Failed to export history. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleScheduleReport = () => {
    toast.info('Opening schedule settings...');
    navigate('/dashboard/reports');
  };

  const handleSetAlerts = () => {
    toast.info('Opening alert configuration...');
    navigate('/dashboard/settings');
  };

  const handleArchiveData = () => {
    toast.info('Archive feature coming soon!');
    // Could implement archiving old activity data
  };

  const handleRefresh = () => {
    fetchActivityStats(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <HistoryIcon className="h-8 w-8 text-green-600" />
            Activity History
          </h1>
          <p className="text-muted-foreground">
            Comprehensive tracking of all system activities and user actions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={handleExportHistory}
            disabled={exportLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            {exportLoading ? 'Exporting...' : 'Export History'}
          </Button>
          <Button
            onClick={() => {
              toast.info('Advanced filters feature coming soon!');
              // Could open a modal with advanced filtering options
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Activity Statistics */}
      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <p className="font-semibold text-red-700">Failed to Load Activity Data</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Button onClick={() => fetchActivityStats()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {activityStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stat.trend === "up" ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingUp className="mr-1 h-3 w-3 text-red-600 rotate-180" />
                    )}
                    <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                      {stat.change}
                    </span>
                    <span className="ml-1">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Activity History Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="user">User Actions</TabsTrigger>
          <TabsTrigger value="system">System Events</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Activity Log</CardTitle>
              <CardDescription>
                All system activities and user actions in chronological order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistory showFilters={true} limit={50} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Actions</CardTitle>
              <CardDescription>
                Activities performed by users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistory 
                showFilters={true} 
                limit={50} 
                filterCategory="user"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Events</CardTitle>
              <CardDescription>
                Automated system activities and background processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistory 
                showFilters={true} 
                limit={50} 
                filterCategory="system"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Events</CardTitle>
              <CardDescription>
                High-priority events that require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistory 
                showFilters={true} 
                limit={50} 
                filterPriority="critical"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common history-related tasks and utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col py-4 hover:bg-blue-50 hover:border-blue-500 transition-colors"
              onClick={handleScheduleReport}
            >
              <Calendar className="h-6 w-6 mb-2 text-blue-600" />
              <span className="text-sm font-medium">Schedule Report</span>
              <span className="text-xs text-muted-foreground mt-1">Automate activity reports</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col py-4 hover:bg-orange-50 hover:border-orange-500 transition-colors"
              onClick={handleSetAlerts}
            >
              <Clock className="h-6 w-6 mb-2 text-orange-600" />
              <span className="text-sm font-medium">Set Alerts</span>
              <span className="text-xs text-muted-foreground mt-1">Configure notifications</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col py-4 hover:bg-purple-50 hover:border-purple-500 transition-colors"
              onClick={handleArchiveData}
            >
              <FileText className="h-6 w-6 mb-2 text-purple-600" />
              <span className="text-sm font-medium">Archive Data</span>
              <span className="text-xs text-muted-foreground mt-1">Store old records</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
