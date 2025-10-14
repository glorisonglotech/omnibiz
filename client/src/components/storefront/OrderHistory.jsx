import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";

const mockOrders = [
  {
    id: "ORD-1001",
    date: "2025-10-12",
    total: 1450,
    status: "delivered",
    items: [
      { name: "Premium Hair Shampoo", quantity: 2 },
      { name: "Organic Face Mask", quantity: 1 },
    ],
    trackingNumber: "TRK-ABC123",
  },
  {
    id: "ORD-1002",
    date: "2025-10-13",
    total: 875,
    status: "shipped",
    items: [{ name: "Hair Styling Gel", quantity: 3 }],
    trackingNumber: "TRK-XYZ789",
  },
  {
    id: "ORD-1003",
    date: "2025-10-14",
    total: 2200,
    status: "processing",
    items: [{ name: "Professional Hair Dryer", quantity: 1 }],
  },
];

const OrderHistory = () => {
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
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "default";
      case "delivered":
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Order History</h2>
      
      {mockOrders.map((order) => (
        <Card key={order.id} className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Order {order.id}</CardTitle>
              <Badge variant={getStatusColor(order.status)} className="gap-1">
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="text-sm">
                  <span className="text-foreground">{item.name}</span>
                  <span className="text-muted-foreground"> × {item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="font-semibold text-foreground">Total: KES {order.total.toFixed(2)}</span>
              <div className="flex gap-2">
                {order.trackingNumber && (
                  <Button variant="outline" size="sm">
                    Track Order
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderHistory;