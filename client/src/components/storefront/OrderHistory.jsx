import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket } = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchOrders();
    socket.on('order_updated', handler);
    return () => {
      socket.off('order_updated', handler);
    };
  }, [socket]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Prefer client endpoint which returns paginated structure
      const response = await api.get('/client/orders');
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.orders || []);
      setOrders(list);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
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
            <Button onClick={fetchOrders}>Try Again</Button>
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
                        {item.currency || '$'} {(item.price * item.quantity).toFixed(2)}
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
                    ${order.total?.toFixed(2) || '0.00'}
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