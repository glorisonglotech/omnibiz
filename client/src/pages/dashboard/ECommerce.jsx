import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useFinancial } from "@/context/FinancialContext";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  Eye,
  Plus,
  Link2,
  Copy,
  Share2,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';


const defaultProduct = {
  name: "",
  sku: "",
  category: "",
  stockQuantity: "",
  reorderLevel: "",
  price: "",
  supplierName: "",
  description: "",
};

const ECommerce = () => {
  const { isAuthenticated } = useAuth();
  const { refreshFinancialData } = useFinancial();

  const [orders, setOrders] = useState([]);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // Add Product Dialog State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState(defaultProduct);

  // Invite Link State
  const [inviteLink, setInviteLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view your orders.");
        return;
      }
      try {
        const response = await api.get("/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setOrders(response.data || []);
      } catch (error) {
        toast.error("We couldn't load your orders right now.");
        // eslint-disable-next-line no-console
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  const handleEditClick = (order) => {
    setEditOrder({ ...order });
    setIsEditOrderOpen(true);
  };

  const handleViewClick = (order) => {
    setViewOrder(order);
    setIsViewOrderOpen(true);
  };

  const handleEditOrderChange = (field, value) => {
    if (field === "customerName" || field === "customerEmail") {
      setEditOrder((prev) => ({
        ...prev,
        customer: {
          ...(prev?.customer || {}),
          [field === "customerName" ? "name" : "email"]: value,
        },
      }));
    } else {
      setEditOrder((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleUpdateOrder = async () => {
    try {
      const id = editOrder.id || editOrder._id;
      const response = await api.put(`/orders/${id}`, editOrder, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === response.data.id || o._id === response.data.id ? response.data : o))
      );
      setIsEditOrderOpen(false);
      setEditOrder(null);
      toast.success("The order has been updated successfully.");

      if (response.data.status === "Paid" || response.data.paymentStatus === "Paid") {
        refreshFinancialData?.();
      }
    } catch (error) {
      toast.error("We couldn't update this order.");
      // eslint-disable-next-line no-console
      console.error("Error updating order:", error);
    }
  };

  // Add Product Handlers
  const handleNewProductChange = (field, value) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddProduct = async () => {
    const requiredFields = [
      "name",
      "sku",
      "category",
      "stockQuantity",
      "price",
      "supplierName",
    ];
    const hasEmptyField = requiredFields.some(
      (field) => !newProduct[field]?.toString().trim()
    );
    if (hasEmptyField) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const sanitizedProduct = {
      ...newProduct,
      stockQuantity: Number(newProduct.stockQuantity),
      reorderLevel: Number(newProduct.reorderLevel),
      price: Number(newProduct.price),
    };
    try {
      const token = localStorage.getItem("token");
      await api.post("/products", sanitizedProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setNewProduct(defaultProduct);
      setIsAddProductOpen(false);
      toast.success("Product added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error adding product.");
      // eslint-disable-next-line no-console
      console.error("Error adding product:", error);
    }
  };

  // Invite Link Handlers

  const generateInviteLink = async () => {
    setIsGenerating(true);
    try {
      const uniqueCode = uuidv4().replace(/-/g, '').substring(0, 12);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      const response = await api.post("/user/invite-code", { inviteCode: uniqueCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Invite code save response:", response.data); // Debug
      const link = `${window.location.origin}/client/signup/${uniqueCode}`;
      setInviteLink(link);
      toast.success("Invite link generated and saved. Share this link with your clients.");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Failed to generate invite link: ${errorMessage}`);
      console.error("Error generating invite code:", error.response?.data || error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard.");
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Join My Store",
          text: "You've been invited to access my exclusive online store!",
          url: inviteLink,
        })
        .catch(() => { });
    } else {
      copyToClipboard();
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { variant: "secondary" },
      Processing: { variant: "default" },
      Shipped: { variant: "default" },
      Delivered: { variant: "default" },
      Paid: { variant: "default" },
      Cancelled: { variant: "destructive" },
    };
    return <Badge variant={statusConfig[status]?.variant || "default"}>{status}</Badge>;
  };

  // Derived values from orders for stats
  const totalOrders = orders.length;
  const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const avgOrderValue = totalOrders ? (revenue / totalOrders).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">E-Commerce Dashboard</h1>
          <p className="text-muted-foreground">Manage your online store and orders</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.href = '/store'}
          >
            <Package className="h-4 w-4" />
            Store Overview
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Link2 className="h-4 w-4" />
                Generate Invite Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Clients to Your Store</DialogTitle>
                <DialogDescription>
                  Generate a unique invite link and share it with your clients. They'll sign up and get
                  access to your exclusive store.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {!inviteLink ? (
                  <Button onClick={generateInviteLink} disabled={isGenerating} className="w-full">
                    <Link2 className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate Invite Link"}
                  </Button>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <Input readOnly value={inviteLink} className="flex-1 bg-muted" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={copyToClipboard} variant="outline" className="flex-1 gap-2">
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button onClick={shareLink} className="flex-1 gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      💡 Tip: This link is unique to your store. Clients who use it will only see your
                      products.
                    </p>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              // Open the client storefront in a new tab
              const inviteCode = user?.inviteCode || 'demo';
              window.open(`/client/store/${inviteCode}`, '_blank');
              toast.success('Opening your store in a new tab...');
            }}
          >
            <Eye className="h-4 w-4" />
            View Store
          </Button>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-green-500 hover:bg-green-400">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Register a new product to your inventory
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e) =>
                      handleNewProductChange("name", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="Product SKU"
                    value={newProduct.sku}
                    onChange={(e) =>
                      handleNewProductChange("sku", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="Enter category"
                    value={newProduct.category}
                    onChange={(e) =>
                      handleNewProductChange("category", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="e.g. 25"
                      value={newProduct.stockQuantity}
                      onChange={(e) =>
                        handleNewProductChange("stockQuantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      value={newProduct.reorderLevel}
                      onChange={(e) =>
                        handleNewProductChange("reorderLevel", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 29.99"
                      value={newProduct.price}
                      onChange={(e) =>
                        handleNewProductChange("price", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      placeholder="Supplier name"
                      value={newProduct.supplierName}
                      onChange={(e) =>
                        handleNewProductChange("supplierName", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Product description"
                    value={newProduct.description}
                    onChange={(e) =>
                      handleNewProductChange("description", e.target.value)
                    }
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="text-red-500 cursor-pointer hover:text-red-400"
                  onClick={() => setIsAddProductOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-500 cursor-pointer hover:bg-green-400"
                  onClick={handleAddProduct}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Add Product
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
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-green-600">+8.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenue.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">${avgOrderValue}</div>
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
                {orders.map((order, index) => (
                  <TableRow key={order._id || order.id || `order-${index}`}>
                    <TableCell className="font-medium">{order.orderId || order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer?.name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.date
                        ? new Date(order.date).toLocaleDateString()
                        : ""}
                    </TableCell>
                    <TableCell>${Number(order.total || 0).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewClick(order)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(order)}>
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Top Products (static content preserved) */}
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
                { name: "Professional Hair Dryer", sales: 67, revenue: "$13,393" },
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
              {orders.filter((o) => o.status === "Pending").length}
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
              {orders.filter((o) => o.status === "Processing").length}
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
              {orders.filter((o) => o.status === "Shipped").length}
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
              {orders.filter((o) => o.status === "Delivered").length}
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
              <DialogDescription>View order information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Order ID</Label>
                <div className="font-medium">{viewOrder.orderId || viewOrder.id}</div>
              </div>
              <div>
                <Label>Customer</Label>
                <div>{viewOrder.customer?.name}</div>
              </div>
              <div>
                <Label>Email</Label>
                <div>{viewOrder.customer?.email}</div>
              </div>
              <div>
                <Label>Date</Label>
                <div>
                  {viewOrder.date ? new Date(viewOrder.date).toLocaleString() : ""}
                </div>
              </div>
              <div>
                <Label>Total</Label>
                <div>${Number(viewOrder.total || 0).toFixed(2)}</div>
              </div>
              <div>
                <Label>Status</Label>
                <div>{getStatusBadge(viewOrder.status)}</div>
              </div>
              <div>
                <Label>Items</Label>
                <div>
                  {Array.isArray(viewOrder.items)
                    ? `${viewOrder.items.length} items`
                    : viewOrder.items}
                </div>
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
              <DialogDescription>Update order details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-customer">Customer Name</Label>
                <Input
                  id="edit-customer"
                  value={editOrder.customer?.name || ""}
                  onChange={(e) => handleEditOrderChange("customerName", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Customer Email</Label>
                <Input
                  id="edit-email"
                  value={editOrder.customer?.email || ""}
                  onChange={(e) => handleEditOrderChange("customerEmail", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Order Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={
                    editOrder.date
                      ? new Date(editOrder.date).toISOString().slice(0, 10)
                      : ""
                  }
                  onChange={(e) => handleEditOrderChange("date", e.target.value)}
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
                    value={editOrder.total || ""}
                    onChange={(e) => handleEditOrderChange("total", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-items">Number of Items</Label>
                  <Input
                    id="edit-items"
                    type="number"
                    min="0"
                    value={Array.isArray(editOrder.items) ? editOrder.items.length : (editOrder.items || 0)}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      const itemsArray = Array.from({ length: count }, (_, index) => ({
                        id: index + 1,
                        name: `Item ${index + 1}`,
                        quantity: 1,
                        price:
                          count > 0 ? Number(editOrder.total || 0) / count : 0,
                      }));
                      handleEditOrderChange("items", itemsArray);
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editOrder.status || "Pending"}
                  onValueChange={(value) => handleEditOrderChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-notes"
                  value={editOrder.notes || ""}
                  onChange={(e) => handleEditOrderChange("notes", e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOrderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateOrder}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ECommerce;