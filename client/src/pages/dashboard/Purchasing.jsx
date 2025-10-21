import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  Truck,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  User,
  Building,
  CreditCard,
  Activity,
  TrendingUp,
  FileText,
  Radio
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

const Purchasing = () => {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const refreshIntervalRef = useRef(null);

  const [newOrder, setNewOrder] = useState({
    supplier: '',
    items: [{ product: '', quantity: 1, unitPrice: 0 }],
    expectedDelivery: '',
    notes: '',
    priority: 'medium'
  });

  // Sample data - replace with API calls
  const sampleOrders = [
    {
      id: 1,
      orderNumber: 'PO-001',
      supplier: 'ABC Suppliers Ltd',
      totalAmount: 25000,
      status: 'pending',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-22',
      items: [
        { product: 'Office Chairs', quantity: 10, unitPrice: 2000 },
        { product: 'Desk Lamps', quantity: 5, unitPrice: 1000 }
      ]
    },
    {
      id: 2,
      orderNumber: 'PO-002',
      supplier: 'XYZ Trading Co',
      totalAmount: 18500,
      status: 'approved',
      orderDate: '2024-01-14',
      expectedDelivery: '2024-01-20',
      items: [
        { product: 'Laptops', quantity: 3, unitPrice: 5500 },
        { product: 'Keyboards', quantity: 10, unitPrice: 250 }
      ]
    },
    {
      id: 3,
      orderNumber: 'PO-003',
      supplier: 'Tech Solutions Inc',
      totalAmount: 45000,
      status: 'delivered',
      orderDate: '2024-01-10',
      expectedDelivery: '2024-01-18',
      items: [
        { product: 'Servers', quantity: 1, unitPrice: 45000 }
      ]
    }
  ];

  const sampleSuppliers = [
    { id: 1, name: 'ABC Suppliers Ltd', contact: '+254 700 123 456', email: 'info@abcsuppliers.com' },
    { id: 2, name: 'XYZ Trading Co', contact: '+254 700 789 012', email: 'sales@xyztrading.com' },
    { id: 3, name: 'Tech Solutions Inc', contact: '+254 700 345 678', email: 'orders@techsolutions.com' }
  ];

  useEffect(() => {
    fetchPurchaseData();
  }, []);

  const fetchPurchaseData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch purchase orders from database
      const [ordersRes, suppliersRes] = await Promise.allSettled([
        api.get('/purchasing/orders', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/purchasing/suppliers', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Use API data or fallback to sample data
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
        setPurchaseOrders(ordersRes.value.data);
      } else {
        setPurchaseOrders(sampleOrders);
      }

      if (suppliersRes.status === 'fulfilled' && suppliersRes.value?.data) {
        setSuppliers(suppliersRes.value.data);
      } else {
        setSuppliers(sampleSuppliers);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching purchase data:', error);
      toast.error('Error loading purchase data');
      setPurchaseOrders(sampleOrders);
      setSuppliers(sampleSuppliers);
      setLoading(false);
    }
  };

  // Socket.IO real-time updates
  useEffect(() => {
    if (socket && connected) {
      // Join purchasing room
      socket.emit('join_purchasing', { userId: user?._id });

      // Listen for purchase order updates
      socket.on('purchase_order_updated', (data) => {
        setPurchaseOrders(prev => prev.map(order =>
          order.id === data.id ? { ...order, ...data } : order
        ));
        toast.info(`Purchase order ${data.orderNumber}: ${data.status}`);
        
        // Add to activities
        setActivities(prev => [{
          id: Date.now(),
          type: 'order_update',
          message: `PO ${data.orderNumber} status changed to ${data.status}`,
          timestamp: new Date()
        }, ...prev]);
      });

      // Listen for delivery updates
      socket.on('delivery_status_updated', (data) => {
        setPurchaseOrders(prev => prev.map(order =>
          order.id === data.orderId ? { ...order, deliveryStatus: data.status } : order
        ));
        toast.success(`Delivery update: ${data.status}`);
      });

      // Listen for payment updates
      socket.on('payment_processed', (data) => {
        setPurchaseOrders(prev => prev.map(order =>
          order.id === data.orderId ? { ...order, paymentStatus: data.status } : order
        ));
        toast.success(`Payment ${data.status} for ${data.orderNumber}`);
        
        setActivities(prev => [{
          id: Date.now(),
          type: 'payment',
          message: `Payment ${data.status} - ${data.amount}`,
          timestamp: new Date()
        }, ...prev]);
      });

      return () => {
        socket.off('purchase_order_updated');
        socket.off('delivery_status_updated');
        socket.off('payment_processed');
      };
    }
  }, [socket, connected, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPurchaseData();
    setRefreshing(false);
    toast.success('Purchase data refreshed!');
  };

  const handleAddOrder = async () => {
    if (!newOrder.supplier || newOrder.items.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const totalAmount = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      
      const orderData = {
        ...newOrder,
        orderNumber: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
        totalAmount,
        status: 'pending',
        orderDate: new Date().toISOString().split('T')[0]
      };

      setPurchaseOrders([orderData, ...purchaseOrders]);
      setIsAddOrderOpen(false);
      setNewOrder({
        supplier: '',
        items: [{ product: '', quantity: 1, unitPrice: 0 }],
        expectedDelivery: '',
        notes: '',
        priority: 'medium'
      });
      
      toast.success('Purchase order created successfully!');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast.error('Error creating purchase order');
    }
  };

  const addItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { product: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = newOrder.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'outline', color: 'text-yellow-600', icon: Clock },
      approved: { variant: 'outline', color: 'text-blue-600', icon: CheckCircle },
      delivered: { variant: 'outline', color: 'text-green-600', icon: Package },
      cancelled: { variant: 'outline', color: 'text-red-600', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const totalPending = purchaseOrders.filter(order => order.status === 'pending').length;
  const totalApproved = purchaseOrders.filter(order => order.status === 'approved').length;
  const totalValue = purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchasing</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and supplier relationships •
            {connected ? (
              <span className="text-green-600"> 🟢 Real-time Connected</span>
            ) : (
              <span className="text-red-600"> 🔴 Offline Mode</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing || loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-400">
                <Plus className="h-4 w-4 mr-2" />
                New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Create a new purchase order for your suppliers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier *</Label>
                    <Select value={newOrder.supplier} onValueChange={(value) => setNewOrder({...newOrder, supplier: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Expected Delivery</Label>
                    <Input
                      type="date"
                      value={newOrder.expectedDelivery}
                      onChange={(e) => setNewOrder({...newOrder, expectedDelivery: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={newOrder.priority} onValueChange={(value) => setNewOrder({...newOrder, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Items *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Input
                            placeholder="Product name"
                            value={item.product}
                            onChange={(e) => updateItem(index, 'product', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            placeholder="Unit price"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-1">
                          <p className="text-sm font-medium">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </p>
                        </div>
                        <div className="col-span-1">
                          {newOrder.items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-right mt-2">
                    <p className="text-lg font-semibold">
                      Total: {formatCurrency(newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes or requirements"
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOrderOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddOrder}>
                  Create Purchase Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{purchaseOrders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{totalPending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Orders</p>
                <p className="text-2xl font-bold">{totalApproved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="activity">Activity & Payments</TabsTrigger>
        </TabsList>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Manage and track all purchase orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(order.expectedDelivery).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsViewOrderOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Suppliers</CardTitle>
                  <CardDescription>Manage supplier contacts and information</CardDescription>
                </div>
                <Button onClick={() => setIsAddSupplierOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((supplier) => (
                  <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        {supplier.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.contact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity & Payments Tab */}
        <TabsContent value="activity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Track purchasing activities in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className={`mt-1 rounded-full p-2 ${
                          activity.type === 'payment' ? 'bg-green-100' :
                          activity.type === 'order_update' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {activity.type === 'payment' ? (
                            <CreditCard className="h-4 w-4 text-green-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No recent activities</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Tracking
                </CardTitle>
                <CardDescription>Monitor payment status for purchase orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchaseOrders.filter(order => order.status !== 'cancelled').map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{order.supplier}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(order.totalAmount)}</p>
                        <Badge variant={
                          order.paymentStatus === 'paid' ? 'default' :
                          order.paymentStatus === 'pending' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {order.paymentStatus || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Tracking */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Status
                </CardTitle>
                <CardDescription>Track delivery status after purchase orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Delivery Status</TableHead>
                      <TableHead>Payment Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.filter(o => o.status === 'approved' || o.status === 'delivered').map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>{new Date(order.expectedDelivery).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.deliveryStatus || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}>
                            {order.paymentStatus || 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Order Dialog */}
      <Dialog open={isViewOrderOpen} onOpenChange={setIsViewOrderOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber} - {selectedOrder?.supplier}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Date</Label>
                  <p className="text-sm">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <p className="text-sm">{new Date(selectedOrder.expectedDelivery).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="text-sm font-semibold">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>

              <div>
                <Label>Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOrderOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Purchasing;
