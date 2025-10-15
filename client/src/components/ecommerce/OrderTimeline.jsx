import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  AlertCircle,
  XCircle 
} from "lucide-react";

const OrderTimeline = ({ orders = [], limit = 10 }) => {
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }, [orders, limit]);

  const getStatusIcon = (status) => {
    switch(status) {
      case "Delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Shipped":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "Processing":
        return <Package className="h-5 w-5 text-purple-600" />;
      case "Cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Delivered": return "bg-green-500";
      case "Shipped": return "bg-blue-500";
      case "Processing": return "bg-purple-500";
      case "Cancelled": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return orderDate.toLocaleDateString();
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest order updates</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent orders</p>
              </div>
            ) : (
              recentOrders.map((order, index) => (
                <div key={order._id || order.id} className="relative pl-8 pb-4">
                  {/* Timeline line */}
                  {index !== recentOrders.length - 1 && (
                    <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full ${getStatusColor(order.status)} border-4 border-background`} />
                  
                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(order.status)}
                          <span className="font-semibold text-sm">
                            Order #{order.orderId || order.id}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground">
                          {order.customer?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          ${Number(order.total || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(order.date)}
                        </p>
                      </div>
                    </div>
                    
                    {order.items && Array.isArray(order.items) && (
                      <div className="text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;
