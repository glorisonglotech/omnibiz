import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // Assuming you have an AuthContext for user state
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
import { adminAPI, clientAPI } from "@/lib/api"; // Import API functions

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth(); // Getting the logged-in user from context
  const [stats, setStats] = useState([
    { title: "Total Revenue", value: "$0", change: "+0.0%", trend: "up", icon: DollarSign, description: "from last month" },
    { title: "Total Orders", value: "0", change: "+0.0%", trend: "up", icon: ShoppingCart, description: "from last month" },
    { title: "Active Customers", value: "0", change: "+0.0%", trend: "up", icon: Users, description: "from last month" },
    { title: "Appointments Today", value: "0", change: "-0.0%", trend: "down", icon: Calendar, description: "from yesterday" }
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // If user is not logged in, redirect them to the login page
  if (!isAuthenticated) {
    window.location.href = "/login"; // Redirect to login page
    return null; // Prevent rendering the dashboard
  }

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, activitiesData, lowStockData, appointmentsData] = await Promise.all([
          adminAPI.getDashboardStats(), // Replace with your actual API endpoint
          adminAPI.getAllOrders({ limit: 5 }),  // Assuming this returns recent activities
          adminAPI.getLowStockItems(),  // Assuming this returns low stock items
          clientAPI.getDashboardStats()  // Assuming this fetches appointments
        ]);

        // Set data for stats, ensure we set defaults to 0 if no data
        setStats((prevStats) =>
          prevStats.map((stat, index) => ({
            ...stat,
            value: statsData?.data?.[index]?.value || stat.value,
            change: statsData?.data?.[index]?.change || stat.change,
            trend: statsData?.data?.[index]?.trend || stat.trend
          }))
        );
        
        // Set other data
        setRecentActivities(activitiesData?.data || []);
        setLowStockItems(lowStockData?.data || []);
        setUpcomingAppointments(appointmentsData?.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchDashboardData();
  }, []);

  // If data is loading, show a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your business today.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button>
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
              <Button variant="outline" className="h-auto flex-col py-4">
                <Package className="h-6 w-6 mb-2" />
                <span className="text-xs">Add Product</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-xs">Book Appointment</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="text-xs">Create Invoice</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
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