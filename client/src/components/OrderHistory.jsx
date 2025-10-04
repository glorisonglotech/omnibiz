import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Eye, 
  Download,
  Filter,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const OrderHistory = ({ userId = null, showFilters = true, limit = 20 }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    orderType: 'all',
    priority: 'all',
    search: '',
    dateRange: null,
    minAmount: '',
    maxAmount: '',
    page: 1
  });

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalValue: 0,
    averageOrderValue: 0,
    statusBreakdown: {},
    monthlyTrends: []
  });

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [filters, userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.orderType && filters.orderType !== 'all') params.append('orderType', filters.orderType);
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateRange?.from) params.append('startDate', filters.dateRange.from.toISOString());
      if (filters.dateRange?.to) params.append('endDate', filters.dateRange.to.toISOString());
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      params.append('page', filters.page.toString());
      params.append('limit', limit.toString());

      const endpoint = user.role === 'client' ? '/client/orders' : '/admin/orders';
      const response = await api.get(`${endpoint}?${params}`);
      
      setOrders(response.data.orders || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await api.get('/dashboard/analytics/orders?timeframe=12m');
      setOrderStats(response.data.data || {});
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleViewOrder = (orderId) => {
    // Navigate to order details page
    window.open(`/dashboard/orders/${orderId}`, '_blank');
  };

  const handleExportOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.dateRange?.from) params.append('startDate', filters.dateRange.from.toISOString());
      if (filters.dateRange?.to) params.append('endDate', filters.dateRange.to.toISOString());
      params.append('format', 'csv');

      const endpoint = user.role === 'client' ? '/client/orders/export' : '/admin/orders/export';
      const response = await api.get(`${endpoint}?${params}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Draft': { color: 'bg-gray-100 text-gray-800', icon: Clock },
      'Submitted': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'Under_Review': { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      'Approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'Completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['Draft'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`${colors[priority] || colors.normal} text-xs`}>
        {priority}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Under_Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const orderTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'standard', label: 'Standard' },
    { value: 'bulk', label: 'Bulk' },
    { value: 'custom', label: 'Custom' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <div className="space-y-6">
      {/* Order Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{orderStats.totalOrders || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(orderStats.totalValue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Order</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(orderStats.averageOrderValue || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-orange-600">
                  {orderStats.monthlyTrends?.[0]?.count || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={filters.orderType} onValueChange={(value) => handleFilterChange('orderType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Order ID, customer..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button onClick={handleExportOrders} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  setDate={(range) => handleFilterChange('dateRange', range)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Min Amount</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Max Amount</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found for the selected criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg">{order.orderId}</h3>
                      {getStatusBadge(order.status)}
                      {getPriorityBadge(order.priority)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(order.total)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order._id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Customer:</strong> {order.customer?.name || 'N/A'}</p>
                      <p><strong>Type:</strong> {order.orderType}</p>
                    </div>
                    <div>
                      <p><strong>Items:</strong> {order.items?.length || 0} items</p>
                      <p><strong>Created:</strong> {formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p><strong>Delivery:</strong> {order.deliveryInfo?.address || 'N/A'}</p>
                      <p><strong>Updated:</strong> {formatDate(order.updatedAt)}</p>
                    </div>
                  </div>

                  {order.clientNotes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm"><strong>Notes:</strong> {order.clientNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * limit) + 1} to {Math.min(pagination.currentPage * limit, pagination.totalCount)} of {pagination.totalCount} orders
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistory;
