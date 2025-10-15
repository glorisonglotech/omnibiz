import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Activity
} from "lucide-react";
import { useAuth } from '@/context/AuthContext'
import { clientAPI } from '@/lib/api'; // Import clientAPI for dashboard stats
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth(); // Get the logged-in user from AuthContext
  const navigate = useNavigate();
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

  // Fetch dashboard data when component mounts or user changes
  const fetchDashboardData = async (showToast = false) => {
    if (!user) return; // Ensure user is logged in before fetching

    try {
      if (showToast) {
        setRefreshing(true);
        toast.info('Refreshing dashboard data...');
      } else {
        setLoading(true);
      }
      
      setError(null);
      const response = await clientAPI.getDashboardStats();
      const { stats, recentActivities, lowStockItems, upcomingAppointments } = response.data;

      setDashboardData({
        stats: stats || [],
        recentActivities: recentActivities || [],
        lowStockItems: lowStockItems || [],
        upcomingAppointments: upcomingAppointments || [],
      });
      
      setLastUpdated(new Date());
      if (showToast) {
        toast.success('Dashboard refreshed successfully!');
      }
      
      console.log('✅ Dashboard data loaded:', {
        stats: stats?.length || 0,
        activities: recentActivities?.length || 0,
        lowStock: lowStockItems?.length || 0,
        appointments: upcomingAppointments?.length || 0
      });
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      if (showToast) {
        toast.error('Failed to refresh dashboard data');
      } else {
        toast.error('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000);
    
    return () => clearInterval(interval);
  }, [user]); // Re-fetch if user changes

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

      {/* Stats Cards */}
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