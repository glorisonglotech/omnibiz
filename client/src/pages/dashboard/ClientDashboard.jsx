import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle,
  Plus,
  FileText,
  Star,
  User
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ClientOnly } from '@/components/RoleBasedAccess';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentServiceRequests, setRecentServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, ordersResponse, serviceRequestsResponse] = await Promise.all([
        api.get('/dashboard?timeframe=30d'),
        api.get('/client/orders?limit=5'),
        api.get('/client/service-requests?limit=5')
      ]);

      // Ensure we have the correct data structure
      const dashboardData = dashboardResponse.data?.data || dashboardResponse.data;
      console.log('Dashboard data received:', dashboardData); // Debug log

      setStats(dashboardData);
      setRecentOrders(ordersResponse.data?.orders || ordersResponse.data?.data || []);
      setRecentServiceRequests(serviceRequestsResponse.data?.requests || serviceRequestsResponse.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Set default empty stats to prevent crashes
      setStats({
        overview: {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalServiceRequests: 0,
          activeServiceRequests: 0,
          averageOrderValue: 0,
          completionRate: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Under_Review': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Processing': 'bg-purple-100 text-purple-800',
      'Shipped': 'bg-indigo-100 text-indigo-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ClientOnly fallback={<div className="text-center p-8 text-red-500">Access Denied: Client access required</div>}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Client Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back, {user?.name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {user?.assignedAdmin && (
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-300">Your Admin</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.assignedAdmin.name}
                </p>
              </div>
            )}
            <Badge variant="outline" className="text-sm">
              {user?.clientType || 'Client'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overview?.totalOrders || 0}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Avg: KES {Math.round(stats.overview?.averageOrderValue || 0).toLocaleString()}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.overview?.pendingOrders || 0}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Awaiting approval
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Completed Orders
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.overview?.completedOrders || 0}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {Math.round(stats.overview?.completionRate || 0)}% completion rate
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Service Requests
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.overview?.totalServiceRequests || 0}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.overview?.activeServiceRequests || 0} active
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.orderId}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        ${order.total} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Service Requests */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Service Requests
              </h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentServiceRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No service requests yet</p>
              ) : (
                recentServiceRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {request.serviceType} • {request.priority}
                      </p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              <span className="text-sm">New Order</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Request Service</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Package className="h-6 w-6 mb-2" />
              <span className="text-sm">Track Orders</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <User className="h-6 w-6 mb-2" />
              <span className="text-sm">My Profile</span>
            </Button>
          </div>
        </Card>

        {/* Account Information */}
        {user?.assignedAdmin && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Manager
            </h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.assignedAdmin.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {user.assignedAdmin.email}
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Contact
              </Button>
            </div>
          </Card>
        )}
      </div>
    </ClientOnly>
  );
};

export default ClientDashboard;
