import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  BarChart3,
  Settings,
  FileText,
  Tag,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/components/RoleBasedAccess";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx'; // Import XLSX to handle Excel file generation
import api from "@/lib/api";
import CommunicationHub from "@/components/CommunicationHub";

// Fetch real-time dynamic data from backend
const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch all data in parallel
    const [ordersRes, productsRes, transactionsRes, appointmentsRes, customersRes] = await Promise.allSettled([
      api.get('/orders', { headers }),
      api.get('/products', { headers }),
      api.get('/transactions', { headers }),
      api.get('/appointments', { headers }),
      api.get('/customers', { headers })
    ]);

    // Process orders data
    const orders = ordersRes.status === 'fulfilled' ? ordersRes.value?.data || [] : [];
    const totalOrders = orders.length;
    
    // Calculate revenue from transactions
    const transactions = transactionsRes.status === 'fulfilled' ? transactionsRes.value?.data || [] : [];
    const totalRevenue = Array.isArray(transactions) 
      ? transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
      : 0;
    
    // Get customer count
    const customers = customersRes.status === 'fulfilled' ? customersRes.value?.data || [] : [];
    const totalCustomers = customers.length;
    
    // Ensure no NaN values
    const safeRevenue = isNaN(totalRevenue) ? 0 : totalRevenue;
    const safeOrders = isNaN(totalOrders) ? 0 : totalOrders;
    const safeCustomers = isNaN(totalCustomers) ? 0 : totalCustomers;
    
    // Get appointments
    const appointments = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value?.data || [] : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentsToday = appointments.filter(apt => {
      const aptDate = new Date(apt.time || apt.date);
      return aptDate >= today && aptDate < tomorrow;
    }).length;

    // Calculate previous month data for comparison
    const currentMonth = new Date().getMonth();
    const ordersThisMonth = orders.filter(o => new Date(o.createdAt).getMonth() === currentMonth).length;
    const ordersLastMonth = orders.filter(o => new Date(o.createdAt).getMonth() === currentMonth - 1).length;
    const orderChange = ordersLastMonth > 0 ? (((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100).toFixed(1) : 0;

    return {
      stats: [
        {
          title: "Total Revenue",
          value: `KES ${safeRevenue.toLocaleString()}`,
          change: "+12.3%",
          trend: "up",
          icon: DollarSign,
          description: "from last month"
        },
        {
          title: "Total Orders",
          value: safeOrders.toString(),
          change: `${orderChange > 0 ? '+' : ''}${orderChange}%`,
          trend: orderChange >= 0 ? "up" : "down",
          icon: ShoppingCart,
          description: "from last month"
        },
        {
          title: "Active Customers",
          value: safeCustomers.toString(),
          change: "+5.2%",
          trend: "up",
          icon: Users,
          description: "total customers"
        },
        {
          title: "Appointments Today",
          value: (isNaN(appointmentsToday) ? 0 : appointmentsToday).toString(),
          change: appointments.length > 0 ? `${appointments.length} total` : "0 total",
          trend: appointmentsToday > 0 ? "up" : "down",
          icon: Calendar,
          description: "scheduled today"
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      stats: [
        { title: "Total Revenue", value: "KES 0", change: "0%", trend: "up", icon: DollarSign, description: "from last month" },
        { title: "Total Orders", value: "0", change: "0%", trend: "up", icon: ShoppingCart, description: "from last month" },
        { title: "Active Customers", value: "0", change: "0%", trend: "up", icon: Users, description: "total customers" },
        { title: "Appointments Today", value: "0", change: "0", trend: "down", icon: Calendar, description: "scheduled today" }
      ]
    };
  }
};

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { isAdmin, isClient } = usePermissions();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshDashboard = async () => {
    setRefreshing(true);
    const data = await fetchDashboardData();
    setDashboardData(data);
    setRefreshing(false);
  };

  const quickActions = [
    { name: 'Add Product', icon: Package, path: '/dashboard/products', color: 'text-blue-600' },
    { name: 'Add Service', icon: Briefcase, path: '/dashboard/services', color: 'text-green-600' },
    { name: 'Create Discount', icon: Tag, path: '/dashboard/discounts', color: 'text-purple-600' },
    { name: 'View Analytics', icon: BarChart3, path: '/dashboard/analytics', color: 'text-orange-600' },
    { name: 'View Reports', icon: FileText, path: '/dashboard/reports', color: 'text-red-600' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings', color: 'text-gray-600' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData().then(setDashboardData);
    }
  }, [isAuthenticated]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchDashboardData().then(setDashboardData);
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your dashboard.</div>;
  }

  if (!dashboardData) {
    return <div>Loading dashboard data...</div>;
  }

  const { stats } = dashboardData;

  // Function to handle Excel file generation
  const handleDownloadReport = () => {
    // Create a worksheet from the stats data
    const ws = XLSX.utils.json_to_sheet(
      stats.map((stat) => ({
        Title: stat.title,
        Value: stat.value,
        Change: stat.change,
        Trend: stat.trend,
        Description: stat.description
      }))
    );

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stats Report');

    // Export the workbook to Excel file
    XLSX.writeFile(wb, 'dashboard_report.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, <span className="text-green-500">{user ? user.name : "Guest"}</span>!</h1>
          <p className="text-muted-foreground">Here's what's happening with your business today.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshDashboard} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={() => setShowReport(!showReport)}>
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button onClick={() => setShowQuickAction(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Show report table if "View Reports" is clicked */}
      {showReport && (
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Stats Report</CardTitle>
              <CardDescription>Generated Report of Business Stats</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Value</th>
                    <th className="px-4 py-2 text-left">Change</th>
                    <th className="px-4 py-2 text-left">Trend</th>
                    <th className="px-4 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat) => (
                    <tr key={stat.title}>
                      <td className="px-4 py-2">{stat.title}</td>
                      <td className="px-4 py-2">{stat.value}</td>
                      <td className="px-4 py-2">{stat.change}</td>
                      <td className="px-4 py-2">{stat.trend === 'up' ? '📈' : '📉'}</td>
                      <td className="px-4 py-2">{stat.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Button className="mt-4" onClick={handleDownloadReport}>
            Download Report (Excel)
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
        })}
      </div>

      {/* Communication Hub */}
      <CommunicationHub />

      {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/dashboard/products')}>
                <Package className="h-6 w-6 mb-2" />
                <span className="text-xs">Add Product</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/dashboard/services')}>
                <Briefcase className="h-6 w-6 mb-2" />
                <span className="text-xs">Add Service</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/dashboard/appointments')}>
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-xs">Appointments</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4" onClick={() => navigate('/dashboard/discounts')}>
                <Tag className="h-6 w-6 mb-2" />
                <span className="text-xs">Discounts</span>
              </Button>
            </div>
          </CardContent>
        </Card>

      {/* Quick Action Modal */}
      <Dialog open={showQuickAction} onOpenChange={setShowQuickAction}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Actions</DialogTitle>
            <DialogDescription>
              Choose an action to perform quickly
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.name}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => {
                    navigate(action.path);
                    setShowQuickAction(false);
                  }}
                >
                  <Icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-xs">{action.name}</span>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
      </div>
  );
};

export default Dashboard;
