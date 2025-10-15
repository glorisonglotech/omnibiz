import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Eye, Edit, Clock, CheckCircle2, Truck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ModernOrderCard = ({ order, onView, onEdit }) => {
  const getStatusIcon = (status) => {
    const statusMap = {
      Draft: Clock,
      Pending: Clock,
      Submitted: CheckCircle2,
      Processing: Package,
      Shipped: Truck,
      Delivered: CheckCircle2,
      Cancelled: AlertCircle,
      Rejected: AlertCircle,
    };
    return statusMap[status] || Clock;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      Draft: "bg-gray-100 text-gray-800 border-gray-300",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Submitted: "bg-blue-100 text-blue-800 border-blue-300",
      Processing: "bg-purple-100 text-purple-800 border-purple-300",
      Shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
      Delivered: "bg-green-100 text-green-800 border-green-300",
      Cancelled: "bg-red-100 text-red-800 border-red-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getPaymentStatusColor = (status) => {
    const colorMap = {
      Pending: "bg-yellow-100 text-yellow-800",
      Paid: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      Refunded: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const StatusIcon = getStatusIcon(order.status);
  
  // Get first few items to display
  const displayItems = order.items?.slice(0, 3) || [];
  const remainingCount = (order.items?.length || 0) - displayItems.length;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {order.orderId || `Order #${order._id?.slice(-6)}`}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={cn("gap-1 border", getStatusColor(order.status))}>
                <StatusIcon className="h-3 w-3" />
                {order.status}
              </Badge>
              {order.paymentStatus && (
                <Badge className={cn("gap-1", getPaymentStatusColor(order.paymentStatus))}>
                  {order.paymentStatus}
                </Badge>
              )}
              {order.orderType && (
                <Badge variant="outline" className="text-xs">
                  {order.orderType}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${Number(order.total || 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(order.date || order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Info */}
        {order.customer && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-semibold text-sm">{order.customer.name}</p>
              <p className="text-xs text-muted-foreground">{order.customer.email}</p>
            </div>
            {order.customer.phone && (
              <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
            )}
          </div>
        )}

        {/* Product Items with Images */}
        {displayItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Order Items</p>
            <div className="space-y-2">
              {displayItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-colors">
                  {/* Product Image */}
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name || 'Product'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name || 'Product'}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {item.currency || '$'}{Number(item.price || 0).toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {item.currency || '$'}{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              
              {remainingCount > 0 && (
                <div className="text-center py-2">
                  <Badge variant="secondary" className="text-xs">
                    +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Info */}
        {order.deliveryInfo?.address && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-1 mb-1">
              <Truck className="h-3 w-3" />
              Delivery Address
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              {order.deliveryInfo.address}
              {order.deliveryInfo.city && `, ${order.deliveryInfo.city}`}
            </p>
          </div>
        )}

        {/* Order Summary */}
        <div className="pt-3 border-t border-border space-y-1">
          {order.subtotal && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
          )}
          {order.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span>${Number(order.taxAmount).toFixed(2)}</span>
            </div>
          )}
          {order.shippingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping:</span>
              <span>${Number(order.shippingCost).toFixed(2)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span>-${Number(order.discountAmount).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => onView?.(order)}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => onEdit?.(order)}
          >
            <Edit className="h-4 w-4" />
            Edit Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernOrderCard;
