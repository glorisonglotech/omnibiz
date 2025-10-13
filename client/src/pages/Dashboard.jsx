<<<<<<< HEAD

import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/components/RoleBasedAccess";
import AdminDashboard from "./dashboard/AdminDashboard";
import ClientDashboard from "./dashboard/ClientDashboard";
import ManagerDashboard from "./dashboard/ManagerDashboard";
import StaffDashboard from "./dashboard/StaffDashboard";
=======
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
  FileText,
  UserPlus,
  History,
  Brain,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/components/RoleBasedAccess";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from 'xlsx'; // Import XLSX to handle Excel file generation
import ComprehensiveGraphs from "@/components/ComprehensiveGraphs";
import { generateMockGraphData } from "@/hooks/useGraphData";
import RealTimeAIInsights from "@/components/RealTimeAIInsights";

// Placeholder for fetching dynamic data
const fetchDashboardData = async () => {
  // Replace with actual API requests to fetch dynamic data
  return {
    stats: [
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
    ]
  };
};
>>>>>>> 5eac68c625382a3d4c1599eeb687858fcf720f65

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { isAdmin, isClient } = usePermissions();
<<<<<<< HEAD
=======
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [showReport, setShowReport] = useState(false);  // To toggle the report view

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData().then(setDashboardData);
    }
  }, [isAuthenticated]);
>>>>>>> 5eac68c625382a3d4c1599eeb687858fcf720f65

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your dashboard.</div>;
  }

  // Render role-specific dashboards
  if (isAdmin()) {
    return <AdminDashboard />;
  }
  if (isClient()) {
    return <ClientDashboard />;
  }
  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }
  if (user?.role === 'staff') {
    return <StaffDashboard />;
  }

<<<<<<< HEAD
  // Fallback: generic dashboard or message
  return <div>Your role does not have a specific dashboard.</div>;
=======
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
          <Button variant="outline" onClick={() => setShowReport(!showReport)}>
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button
            onClick={() => {
              navigate('/dashboard/history');
              toast.success('Opening activity history...');
            }}
          >
            <History className="mr-2 h-4 w-4" />
            View History
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

      {/* Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ComprehensiveGraphs
          title="Revenue Trends"
          description="Daily revenue and profit analysis"
          type="area"
          data={generateMockGraphData('growth', 30)}
          height={300}
          autoRefresh={true}
          refreshInterval={60000}
        />

        <ComprehensiveGraphs
          title="Sales Performance"
          description="Orders and customer metrics"
          type="composed"
          data={generateMockGraphData('trend', 30)}
          height={300}
          autoRefresh={true}
          refreshInterval={60000}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ComprehensiveGraphs
          title="Product Categories"
          description="Sales distribution by category"
          type="pie"
          data={[
            { name: 'Electronics', value: 35 },
            { name: 'Clothing', value: 25 },
            { name: 'Books', value: 20 },
            { name: 'Home & Garden', value: 15 },
            { name: 'Sports', value: 5 }
          ]}
          height={250}
          showControls={false}
        />

        <ComprehensiveGraphs
          title="Monthly Profits"
          description="Profit trends over time"
          type="bar"
          data={generateMockGraphData('growth', 12)}
          height={250}
        />

        <ComprehensiveGraphs
          title="Customer Growth"
          description="New vs returning customers"
          type="line"
          data={generateMockGraphData('trend', 30)}
          height={250}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col py-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => {
                navigate('/dashboard/products');
                toast.success('Opening products page...');
              }}
            >
              <Package className="h-6 w-6 mb-2 text-blue-600" />
              <span className="text-xs font-medium">Add Product</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 hover:bg-green-50 hover:border-green-300 transition-colors"
              onClick={() => {
                navigate('/dashboard/appointments');
                toast.success('Opening appointments page...');
              }}
            >
              <Calendar className="h-6 w-6 mb-2 text-green-600" />
              <span className="text-xs font-medium">Book Appointment</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 hover:bg-purple-50 hover:border-purple-300 transition-colors"
              onClick={() => {
                navigate('/dashboard/finances');
                toast.success('Opening finances page...');
              }}
            >
              <FileText className="h-6 w-6 mb-2 text-purple-600" />
              <span className="text-xs font-medium">Create Invoice</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 hover:bg-orange-50 hover:border-orange-300 transition-colors"
              onClick={() => {
                navigate('/dashboard/team');
                toast.success('Opening team page...');
              }}
            >
              <UserPlus className="h-6 w-6 mb-2 text-orange-600" />
              <span className="text-xs font-medium">Add Customer</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComprehensiveGraphs
          title="Revenue Trends"
          defaultType="line"
          height={300}
          autoRefresh={true}
          refreshInterval={30000}
        />
        <ComprehensiveGraphs
          title="Sales Performance"
          defaultType="bar"
          height={300}
          autoRefresh={true}
          refreshInterval={30000}
        />
      </div>

      {/* Real-time AI Insights */}
      <RealTimeAIInsights
        title="Business Intelligence"
        autoStart={true}
        showNotifications={true}
        updateInterval={30000}
      />
      </div>
  );
>>>>>>> 5eac68c625382a3d4c1599eeb687858fcf720f65
};

export default Dashboard;
