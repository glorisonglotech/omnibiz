import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingCart, Package, CreditCard, TrendingUp, Eye, Plus, Send } from "lucide-react";

const ECommerce = () => {
  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      customer: "Sarah Johnson",
      email: "sarah@email.com",
      date: "2024-01-15",
      total: 125.50,
      status: "Pending",
      items: 3,
      notes: ""
    },
    {
      id: "ORD-002",
      customer: "Mike Chen",
      email: "mike@email.com",
      date: "2024-01-15",
      total: 89.99,
      status: "Processing",
      items: 2,
      notes: ""
    },
    {
      id: "ORD-003",
      customer: "Emma Wilson",
      email: "emma@email.com",
      date: "2024-01-14",
      total: 299.99,
      status: "Shipped",
      items: 5,
      notes: ""
    },
    {
      id: "ORD-004",
      customer: "David Brown",
      email: "david@email.com",
      date: "2024-01-14",
      total: 45.00,
      status: "Delivered",
      items: 1,
      notes: ""
    }
  ]);

  // Add Order Dialog State
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer: "",
    email: "",
    date: "",
    total: "",
    status: "Pending",
    items: "",
    notes: ""
  });

  // Edit/View Order Dialog State
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  const handleNewOrderChange = (field, value) => {
    setNewOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddOrder = () => {
    if (!newOrder.customer || !newOrder.email || !newOrder.date || !newOrder.total || !newOrder.items) {
      // Optionally show validation error
      return;
    }
    setOrders(prev => [
      {
        id: `ORD-${(prev.length + 1).toString().padStart(3, "0")}`,
        ...newOrder,
        total: parseFloat(newOrder.total),
        items: parseInt(newOrder.items, 10),
      },
      ...prev
    ]);
    setNewOrder({
      customer: "",
      email: "",
      date: "",
      total: "",
      status: "Pending",
      items: "",
      notes: ""
    });
    setIsAddOrderOpen(false);
  };

  const handleEditClick = (order) => {
    setEditOrder({ ...order });
    setIsEditOrderOpen(true);
  };

  const handleEditOrderChange = (field, value) => {
    setEditOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateOrder = () => {
    setOrders(prev =>
      prev.map(o =>
        o.id === editOrder.id
          ? {
              ...editOrder,
              total: parseFloat(editOrder.total),
              items: parseInt(editOrder.items, 10)
            }
          : o
      )
    );
    setIsEditOrderOpen(false);
    setEditOrder(null);
  };

  const handleViewClick = (order) => {
    setViewOrder(order);
    setIsViewOrderOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Pending": { variant: "secondary", color: "bg-yellow-100 text-yellow-800" },
      "Processing": { variant: "default", color: "bg-blue-100 text-blue-800" },
      "Shipped": { variant: "default", color: "bg-purple-100 text-purple-800" },
      "Delivered": { variant: "default", color: "bg-green-100 text-green-800" }
    };
    return <Badge variant={statusConfig[status]?.variant || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">E-Commerce Dashboard</h1>
          <p className="text-muted-foreground">Manage your online store and orders</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Store
          </Button>
          <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
                <DialogDescription>
                  Create a new order for your store
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    placeholder="Enter customer name"
                    value={newOrder.customer}
                    onChange={e => handleNewOrderChange("customer", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Customer Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter customer email"
                    value={newOrder.email}
                    onChange={e => handleNewOrderChange("email", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Order Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newOrder.date}
                    onChange={e => handleNewOrderChange("date", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="total">Total Amount ($)</Label>
                    <Input
                      id="total"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 125.50"
                      value={newOrder.total}
                      onChange={e => handleNewOrderChange("total", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="items">Items</Label>
                    <Input
                      id="items"
                      type="number"
                      min="1"
                      placeholder="e.g. 3"
                      value={newOrder.items}
                      onChange={e => handleNewOrderChange("items", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    placeholder="Pending, Processing, Shipped, Delivered"
                    value={newOrder.status}
                    onChange={e => handleNewOrderChange("status", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Order notes"
                    value={newOrder.notes}
                    onChange={e => handleNewOrderChange("notes", e.target.value)}
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className='text-red-500 cursor-pointer hover:text-red-400' onClick={() => setIsAddOrderOpen(false)}>
                  Cancel
                </Button>
                <Button className='bg-green-500 cursor-pointer hover:bg-green-400' onClick={handleAddOrder}>
                  <Send className="mr-2 h-4 w-4" />
                  Add Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length + 1230}</div>
            <p className="text-xs text-green-600">+8.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.reduce((sum, o) => sum + o.total, 24500).toLocaleString()}
            </div>
            <p className="text-xs text-green-600">+12.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-green-600">+0.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.length ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-green-600">+4.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewClick(order)}>View</Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(order)}>Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling items this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Premium Hair Shampoo", sales: 156, revenue: "$4,680" },
                { name: "Hair Styling Gel", sales: 142, revenue: "$2,268" },
                { name: "Organic Face Mask", sales: 98, revenue: "$4,410" },
                { name: "Professional Hair Dryer", sales: 67, revenue: "$13,393" }
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === "Pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Need processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === "Processing").length}
            </div>
            <p className="text-xs text-muted-foreground">Being prepared</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Shipped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter(o => o.status === "Shipped").length}
            </div>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === "Delivered").length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* View Order Dialog */}
      {isViewOrderOpen && viewOrder && (
        <Dialog open={isViewOrderOpen} onOpenChange={setIsViewOrderOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                View order information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Order ID</Label>
                <div className="font-medium">{viewOrder.id}</div>
              </div>
              <div>
                <Label>Customer</Label>
                <div>{viewOrder.customer}</div>
              </div>
              <div>
                <Label>Email</Label>
                <div>{viewOrder.email}</div>
              </div>
              <div>
                <Label>Date</Label>
                <div>{viewOrder.date}</div>
              </div>
              <div>
                <Label>Total</Label>
                <div>${viewOrder.total}</div>
              </div>
              <div>
                <Label>Status</Label>
                <div>{getStatusBadge(viewOrder.status)}</div>
              </div>
              <div>
                <Label>Items</Label>
                <div>{viewOrder.items}</div>
              </div>
              <div>
                <Label>Notes</Label>
                <div>{viewOrder.notes}</div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOrderOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Order Dialog */}
      {isEditOrderOpen && editOrder && (
        <Dialog open={isEditOrderOpen} onOpenChange={setIsEditOrderOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
              <DialogDescription>
                Update order details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-customer">Customer Name</Label>
                <Input
                  id="edit-customer"
                  value={editOrder.customer}
                  onChange={e => handleEditOrderChange("customer", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Customer Email</Label>
                <Input
                  id="edit-email"
                  value={editOrder.email}
                  onChange={e => handleEditOrderChange("email", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Order Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editOrder.date}
                  onChange={e => handleEditOrderChange("date", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-total">Total Amount ($)</Label>
                  <Input
                    id="edit-total"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editOrder.total}
                    onChange={e => handleEditOrderChange("total", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-items">Items</Label>
                  <Input
                    id="edit-items"
                    type="number"
                    min="1"
                    value={editOrder.items}
                    onChange={e => handleEditOrderChange("items", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Input
                  id="edit-status"
                  value={editOrder.status}
                  onChange={e => handleEditOrderChange("status", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-notes"
                  value={editOrder.notes}
                  onChange={e => handleEditOrderChange("notes", e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className='text-red-500 cursor-pointer hover:text-red-400' onClick={() => setIsEditOrderOpen(false)}>
                Cancel
              </Button>
              <Button className='bg-green-500 cursor-pointer hover:bg-green-400' onClick={handleUpdateOrder}>
                <Send className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ECommerce;