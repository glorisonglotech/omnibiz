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
  Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/components/RoleBasedAccess";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import ClientDashboard from "@/pages/dashboard/ClientDashboard";



const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { isAdmin, isClient } = usePermissions();

  if (loading) {
    return <div>Loading...</div>; // Show loading state while authentication is being checked
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your dashboard.</div>; // Show login prompt if not authenticated
  }

  // Show role-specific dashboards
  if (isAdmin()) {
    return <AdminDashboard />;
  }

  if (isClient()) {
    return <ClientDashboard />;
  }

  // Fallback to default dashboard for other roles or staff
  const stats = [
    {
      title: "Total Revenue",
      value: "$24,589",
      change: "+12.3%",
      trend: "up",
      icon: DollarSign,
      description: "from last month"
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+8.1%",
      trend: "up",
      icon: ShoppingCart,
      description: "from last month"
    },
    {
      title: "Active Customers",
      value: "856",
      change: "+5.2%",
      trend: "up",
      icon: Users,
      description: "from last month"
    },
    {
      title: "Appointments Today",
      value: "12",
      change: "-2.4%",
      trend: "down",
      icon: Calendar,
      description: "from yesterday"
    }
  ];

  const recentActivities = [
    { id: 1, action: "New order received", details: "Order #1234 from John Smith", time: "2 minutes ago", type: "order" },
    { id: 2, action: "Appointment booked", details: "Hair styling with Sarah Johnson", time: "15 minutes ago", type: "appointment" },
    { id: 3, action: "Payment processed", details: "Invoice #5678 - $299.99", time: "1 hour ago", type: "payment" },
    { id: 4, action: "Low stock alert", details: "Shampoo bottles running low", time: "2 hours ago", type: "alert" },
  ];

  const lowStockItems = [
    { name: "Premium Shampoo", stock: 5, reorder: 50 },
    { name: "Hair Conditioner", stock: 8, reorder: 30 },
    { name: "Styling Gel", stock: 3, reorder: 25 },
  ];

  const upcomingAppointments = [
    { id: 1, client: "Emma Wilson", service: "Hair Cut & Style", time: "10:00 AM", duration: "1h 30m" },
    { id: 2, client: "Michael Brown", service: "Beard Trim", time: "11:30 AM", duration: "45m" },
    { id: 3, client: "Lisa Davis", service: "Hair Coloring", time: "2:00 PM", duration: "2h 30m" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, <span className="text-green-500">{user ? user.name : "Guest"}</span></h1>
          <p className="text-muted-foreground">Here's what's happening with your business today.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/analytics')}>
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button
            className='bg-green-500 cursor-pointer hover:bg-green-400'
            onClick={() => navigate('/dashboard/products')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Quick Action
          </Button>
        </div>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-500' :
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
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Stock: {item.stock}</p>
                  </div>
                  <Badge variant="destructive">Reorder {item.reorder}</Badge>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
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
                className="h-auto flex-col py-4"
                onClick={() => navigate('/dashboard/products')}
              >
                <Package className="h-6 w-6 mb-2" />
                <span className="text-xs">Add Product</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                onClick={() => navigate('/dashboard/appointments')}
              >
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-xs">Book Appointment</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                onClick={() => navigate('/dashboard/finances')}
              >
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="text-xs">Create Invoice</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                onClick={() => navigate('/dashboard/team')}
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="text-xs">Add Customer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
