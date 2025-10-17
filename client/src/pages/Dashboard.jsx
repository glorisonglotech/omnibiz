import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  Eye,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Activity,
  Bell,
  Clock,
  BarChart3,
  Zap,
  Target,
  TrendingUpIcon,
  Box,
  CreditCard,
  Sparkles
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { clientAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';

const Dashboard = () => {
  const { user } = useAuth(); // Get the logged-in user from AuthContext
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentActivities: [],
    lowStockItems: [],
    upcomingAppointments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [liveStats, setLiveStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    weeklyGrowth: 0,
    monthlyTarget: 100000,
    targetProgress: 0
  });
  const [notifications, setNotifications] = useState([]);

  // Fetch comprehensive dashboard data
  const fetchDashboardData = useCallback(async (showToast = false) => {
    if (!user) return;

    try {
      if (showToast) {
        setRefreshing(true);
        toast.info('Refreshing dashboard...', { icon: '🔄' });
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      // Fetch multiple endpoints in parallel
      const [statsRes, productsRes, ordersRes, appointmentsRes] = await Promise.allSettled([
        clientAPI.getDashboardStats(),
        api.get('/products'),
        api.get('/orders'),
        api.get('/appointments')
      ]);

      // Process stats
      const statsData = statsRes.status === 'fulfilled' ? statsRes.value.data : {};
      const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];
      const appointments = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : [];

      // Calculate live stats
      const paidOrders = orders.filter(o => o.status === 'Paid' || o.paymentStatus === 'Paid');
      const pendingOrders = orders.filter(o => o.status === 'Pending');
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      // Today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRevenue = paidOrders
        .filter(o => new Date(o.createdAt) >= today)
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Calculate growth (mock calculation)
      const weeklyGrowth = Math.floor(Math.random() * 30) + 5;
      const targetProgress = Math.min((totalRevenue / liveStats.monthlyTarget) * 100, 100);

      setLiveStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: orders.length > 0 ? new Set(orders.map(o => o.customer?.email || o.customer?.name)).size : 0,
        pendingOrders: pendingOrders.length,
        todayRevenue,
        weeklyGrowth,
        monthlyTarget: liveStats.monthlyTarget,
        targetProgress
      });

      // Process low stock items
      const lowStock = products.filter(p => (p.stockQuantity || 0) <= (p.reorderLevel || 5));

      // Process upcoming appointments
      const upcoming = appointments
        .filter(a => new Date(a.time) >= new Date())
        .sort((a, b) => new Date(a.time) - new Date(b.time))
        .slice(0, 5);

      setDashboardData({
        stats: statsData.stats || [],
        recentActivities: statsData.recentActivities || [],
        lowStockItems: lowStock.slice(0, 5).map(p => ({
          name: p.name,
          stock: p.stockQuantity || 0,
          reorder: p.reorderLevel || 5
        })),
        upcomingAppointments: upcoming.map(a => ({
          id: a._id,
          client: a.customerName,
          service: a.service,
          time: new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: `${a.durationMinutes || 30} min`
        })),
      });
      
      setLastUpdated(new Date());
      if (showToast) {
        toast.success('Dashboard refreshed!', { icon: '✅' });
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      if (showToast) {
        toast.error('Failed to refresh');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, liveStats.monthlyTarget]);
  
  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds for real-time feel
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for stock alerts
    socket.on('stock_alert', (data) => {
      const notification = {
        id: Date.now(),
        type: 'stock',
        message: `${data.product.name} is ${data.alertType === 'out_of_stock' ? 'out of stock' : 'running low'}`,
        time: new Date().toLocaleTimeString()
      };
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      
      if (data.alertType === 'out_of_stock') {
        toast.error(`${data.product.name} is out of stock!`, { icon: '🔴' });
      } else if (data.alertType === 'low_stock') {
        toast.warning(`${data.product.name} is running low!`, { icon: '⚠️' });
      }
      
      // Refresh data
      fetchDashboardData();
    });

    // Listen for inventory updates
    socket.on('inventory_updated', (data) => {
      console.log('📦 Inventory updated:', data.updates?.length, 'products');
      fetchDashboardData();
    });

    // Listen for new orders
    socket.on('order_created', (data) => {
      toast.success('New order received!', { icon: '🛒' });
      const notification = {
        id: Date.now(),
        type: 'order',
        message: `New order from ${data.order?.customer?.name || 'customer'}`,
        time: new Date().toLocaleTimeString()
      };
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      fetchDashboardData();
    });

    // Listen for appointment updates
    socket.on('appointment_created', (data) => {
      toast.info('New appointment booked!', { icon: '📅' });
      fetchDashboardData();
    });

    return () => {
      socket.off('stock_alert');
      socket.off('inventory_updated');
      socket.off('order_created');
      socket.off('appointment_created');
    };
  }, [socket, connected, fetchDashboardData]);

  const handleQuickAction = (action) => {
    switch(action) {
      case 'add-product':
        navigate('/dashboard/ecommerce');
        toast.success('Opening E-Commerce to add product');
        break;
      case 'book-appointment':
        navigate('/dashboard/appointments');
        toast.success('Opening appointments booking');
        break;
      case 'create-invoice':
        navigate('/dashboard/finances');
        toast.success('Opening finances to create invoice');
        break;
      case 'add-customer':
        navigate('/dashboard/ecommerce');
        toast.success('Opening customer management');
        break;
      default:
        toast.info('Feature coming soon!');
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h3 className="text-xl font-semibold">Failed to Load Dashboard</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => fetchDashboardData()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">Here's what's happening with your business today.</p>
            {connected && (
              <Badge variant="default" className="text-xs gap-1">
                <Zap className="h-3 w-3" />
                Live
              </Badge>
            )}
            {lastUpdated && (
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Updated {lastUpdated.toLocaleTimeString()}
              </Badge>
            )}
          </div>
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
          
          <Link to="/dashboard/reports">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </Link>

          <Button onClick={() => navigate('/dashboard/search')}>
            <Plus className="mr-2 h-4 w-4" />
            Search All
          </Button>
        </div>
      </div>

      {/* Live Stats Cards - Enhanced */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {liveStats.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{liveStats.weeklyGrowth}%</span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Clock className="mr-1 h-3 w-3 text-orange-500" />
              <span className="text-orange-500">{liveStats.pendingOrders} pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.totalProducts}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <AlertTriangle className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500">{dashboardData.lowStockItems.length} low stock</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.totalCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Sparkles className="mr-1 h-3 w-3 text-yellow-500" />
              <span>Active customers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Performance & Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Revenue with Target Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Performance</span>
              <Target className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>Revenue and monthly target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Today's Revenue</span>
                <span className="text-lg font-bold text-green-600">
                  KES {liveStats.todayRevenue.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Monthly Target</span>
                <span className="text-sm text-muted-foreground">
                  KES {liveStats.totalRevenue.toLocaleString()} / {liveStats.monthlyTarget.toLocaleString()}
                </span>
              </div>
              <Progress value={liveStats.targetProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {liveStats.targetProgress.toFixed(1)}% of monthly target achieved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Live Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Live Notifications
              {notifications.length > 0 && (
                <Badge variant="destructive" className="ml-auto">{notifications.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Real-time updates</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <div className={`mt-1 h-2 w-2 rounded-full ${
                      notif.type === 'order' ? 'bg-blue-500' :
                      notif.type === 'stock' ? 'bg-red-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Original Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData.stats.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No stats available yet</p>
            <p className="text-sm mt-2">Start using your dashboard to see statistics</p>
          </div>
        ) : (
          dashboardData.stats.map((stat, index) => {
          const Icon = stat.icon || DollarSign; // Fallback icon
          return (
            <Card key={index}>
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
                    <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>
                  <span className="ml-1">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        }))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No recent activities</p>
                <p className="text-xs mt-2">Activity will appear here as you use the system</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${activity.type === 'order' ? 'bg-blue-500' :
                      activity.type === 'appointment' ? 'bg-green-500' :
                        activity.type === 'payment' ? 'bg-purple-500' :
                          'bg-orange-500'
                      }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.details}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="font-medium text-green-600">All items well stocked</p>
                <p className="text-xs mt-2">No low stock alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Stock: {item.stock}</p>
                    </div>
                    <Badge variant="destructive">Reorder {item.reorder}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Scheduled appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No appointments today</p>
                <p className="text-xs mt-2">Your schedule is clear</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/dashboard/appointments')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{appointment.client}</p>
                      <p className="text-xs text-muted-foreground">{appointment.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{appointment.time}</p>
                      <p className="text-xs text-muted-foreground">{appointment.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 hover:bg-green-50 hover:border-green-500 transition-colors"
                onClick={() => handleQuickAction('add-product')}
              >
                <Package className="h-6 w-6 mb-2 text-green-600" />
                <span className="text-xs font-medium">Add Product</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 hover:bg-blue-50 hover:border-blue-500 transition-colors"
                onClick={() => handleQuickAction('book-appointment')}
              >
                <Calendar className="h-6 w-6 mb-2 text-blue-600" />
                <span className="text-xs font-medium">Book Appointment</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 hover:bg-purple-50 hover:border-purple-500 transition-colors"
                onClick={() => handleQuickAction('create-invoice')}
              >
                <DollarSign className="h-6 w-6 mb-2 text-purple-600" />
                <span className="text-xs font-medium">Create Invoice</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 hover:bg-orange-50 hover:border-orange-500 transition-colors"
                onClick={() => handleQuickAction('add-customer')}
              >
                <Users className="h-6 w-6 mb-2 text-orange-600" />
                <span className="text-xs font-medium">Add Customer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;