import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings,
  RefreshCw,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { AdminOnly, CanManageOrders, CanManageServices } from '@/components/RoleBasedAccess';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingServiceRequests, setPendingServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, ordersResponse, serviceRequestsResponse] = await Promise.all([
        api.get('/dashboard?timeframe=30d'),
        api.get('/admin/orders?status=Submitted&limit=5'),
        api.get('/admin/service-requests?status=submitted&limit=5')
      ]);

      setStats(dashboardResponse.data.data);
      setPendingOrders(ordersResponse.data.orders || []);
      setPendingServiceRequests(serviceRequestsResponse.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      await api.put(`/admin/orders/${orderId}/approve`, { approved: true });
      toast.success('Order approved successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to approve order:', error);
      toast.error('Failed to approve order');
    }
  };

  const handleAssignOrder = async (orderId) => {
    try {
      await api.put(`/admin/orders/${orderId}/assign`, { adminId: user.id });
      toast.success('Order assigned to you');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to assign order:', error);
      toast.error('Failed to assign order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AdminOnly fallback={<div className="text-center p-8 text-red-500">Access Denied: Admin privileges required</div>}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back, {user?.name}
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </Badge>
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
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">
                      +{stats.overview?.growthRates?.orders || 0}%
                    </span>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    KES {(stats.overview?.totalRevenue || 0).toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">
                      +{stats.overview?.growthRates?.revenue || 0}%
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.overview?.totalUsers || 0}
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">
                      +{stats.overview?.growthRates?.users || 0}%
                    </span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    System Health
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.systemHealth?.status === 'healthy' ? 'Good' : 'Warning'}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-600">
                      {stats.systemHealth?.activeUsers || 0} active users
                    </span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Clients
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.clients.total}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <CanManageOrders>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Orders
                </h3>
                <Badge variant="secondary">{pendingOrders.length}</Badge>
              </div>
              
              <div className="space-y-3">
                {pendingOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending orders</p>
                ) : (
                  pendingOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.orderId}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {order.customer.name} • ${order.total}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!order.assignedAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignOrder(order._id)}
                          >
                            Assign
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleApproveOrder(order._id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </CanManageOrders>

          {/* Pending Service Requests */}
          <CanManageServices>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Service Requests
                </h3>
                <Badge variant="secondary">{pendingServiceRequests.length}</Badge>
              </div>
              
              <div className="space-y-3">
                {pendingServiceRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending service requests</p>
                ) : (
                  pendingServiceRequests.map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {request.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {request.serviceType} • {request.priority}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={request.priority === 'urgent' ? 'destructive' : 'secondary'}
                        >
                          {request.priority}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </CanManageServices>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CanManageOrders>
              <Button variant="outline" className="h-20 flex-col">
                <ShoppingCart className="h-6 w-6 mb-2" />
                <span className="text-sm">Manage Orders</span>
              </Button>
            </CanManageOrders>
            
            <CanManageServices>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm">Service Requests</span>
              </Button>
            </CanManageServices>
            
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">View Clients</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </Card>
      </div>
    </AdminOnly>
  );
};

export default AdminDashboard;
