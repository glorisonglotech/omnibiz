import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle2, Clock, AlertCircle, LogIn } from "lucide-react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { useParams, useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsRelogin, setNeedsRelogin] = useState(false);

  const { socket } = useSocket();
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch if customerToken exists
    const customerToken = localStorage.getItem('customerToken');
    if (customerToken) {
      fetchOrders();
    } else {
      setLoading(false);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    const customerToken = localStorage.getItem('customerToken');
    if (!customerToken) return; // Don't listen if not logged in
    
    const handler = () => {
      const token = localStorage.getItem('customerToken');
      if (token) fetchOrders();
    };
    socket.on('order_updated', handler);
    return () => {
      socket.off('order_updated', handler);
    };
  }, [socket]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setNeedsRelogin(false);
    try {
      // Use customer-specific endpoint with customerToken
      const customerToken = localStorage.getItem('customerToken');
      if (!customerToken) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const response = await api.get('/customer/orders', {
        headers: {
          Authorization: `Bearer ${customerToken}`
        }
      });
      
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.orders || []);
      setOrders(list);
      console.log(`✅ Loaded ${list.length} orders for current customer`);
    } catch (err) {
      console.error('Error fetching orders:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        setError('Please log in to view your orders');
        setNeedsRelogin(true);
      } 
      // Handle old token format (400 with requiresRelogin flag)
      else if (err.response?.status === 400 && err.response?.data?.requiresRelogin) {
        setError('Your session has expired. Please log in again to view your orders.');
        setNeedsRelogin(true);
        // Clear old token to force re-login
        localStorage.removeItem('customerToken');
      }
      // Handle other 400 errors
      else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || 'Unable to load orders';
        setError(errorMessage);
        // If it mentions email or login, suggest relogin
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('login')) {
          setNeedsRelogin(true);
        }
      }
      // Handle other errors
      else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
      case "pending":
        return "secondary";
      case "submitted":
      case "processing":
      case "under_review":
        return "default";
      case "approved":
      case "shipped":
        return "default";
      case "delivered":
        return "outline";
      case "cancelled":
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Order History</h2>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      ) : error ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{error}</h3>
            <div className="flex gap-2 justify-center">
              {needsRelogin ? (
                <Button 
                  onClick={() => {
                    if (inviteCode) {
                      navigate(`/client/login/${inviteCode}`);
                    } else {
                      navigate('/client/login');
                    }
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Log In Again
                </Button>
              ) : (
                <Button onClick={fetchOrders}>Try Again</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Your order history will appear here</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order._id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Order {order.orderId}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getStatusColor(order.status?.toLowerCase())} className="gap-1">
                    {getStatusIcon(order.status?.toLowerCase())}
                    {order.status}
                  </Badge>
                  <Badge variant={order.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                <span>{order.customer?.name}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span className="text-foreground">
                        {item.name || 'Product'} × {item.quantity}
                      </span>
                      <span className="text-muted-foreground">
                        KES {(item.price * item.quantity).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>

                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No items</p>
                )}
              </div>
              
              {order.deliveryInfo?.address && (
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  <strong>Delivery:</strong> {order.deliveryInfo.address}, {order.deliveryInfo.city}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <span className="font-semibold text-foreground">Total: </span>
                  <span className="text-lg font-bold text-green-600">
                    KES {order.total?.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {order.trackingNumber && (
                    <Button variant="outline" size="sm">
                      Track
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default OrderHistory;