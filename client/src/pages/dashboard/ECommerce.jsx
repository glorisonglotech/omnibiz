import { useState, useEffect, lazy, Suspense } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useFinancial } from "@/context/FinancialContext";

// Lazy load heavy components for better performance
const ProductCatalog = lazy(() => import("@/components/ecommerce/ProductCatalog"));
const SalesAnalytics = lazy(() => import("@/components/ecommerce/SalesAnalytics"));
const OrderTimeline = lazy(() => import("@/components/ecommerce/OrderTimeline"));
const QuickActions = lazy(() => import("@/components/ecommerce/QuickActions"));
const EnhancedProductForm = lazy(() => import("@/components/ecommerce/EnhancedProductForm"));
const EnhancedOrderForm = lazy(() => import("@/components/ecommerce/EnhancedOrderForm"));
const RealTimeSync = lazy(() => import("@/components/ecommerce/RealTimeSync"));

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
  const { isAuthenticated, user } = useAuth();
  const { refreshFinancialData } = useFinancial();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [activeView, setActiveView] = useState('overview'); // overview, products, analytics
  const [timeFrame, setTimeFrame] = useState('month');

  // Add Product Dialog State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState(defaultProduct);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // Invite Link State
  const [inviteLink, setInviteLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch orders
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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await api.get("/products", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProducts(response.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
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
      const response = await api.post("/products", sanitizedProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setProducts(prev => [...prev, response.data]);
      setNewProduct(defaultProduct);
      setIsAddProductOpen(false);
      toast.success("Product added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error adding product.");
      // eslint-disable-next-line no-console
      console.error("Error adding product:", error);
    }
  };

  // Product handlers
  const handleEditProduct = (product) => {
    setEditProduct(product);
    setIsEditProductOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    try {
      await api.delete(`/products/${product._id || product.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts(prev => prev.filter(p => (p._id || p.id) !== (product._id || product.id)));
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleViewProduct = (product) => {
    toast.info(`Viewing ${product.name}`);
    // Could open a detailed view modal
  };

  // Import/Export handlers
  const handleImportProducts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        toast.info('Import feature coming soon!');
        // TODO: Implement CSV/Excel parsing
      }
    };
    input.click();
  };

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify({ products, orders }, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ecommerce-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleGenerateReport = () => {
    toast.info('Generating report...');
    setTimeout(() => {
      toast.success('Report generation coming soon!');
    }, 1000);
  };

  // Real-time sync handlers
  const handleProductRealTimeUpdate = (data) => {
    setProducts(prev => {
      const index = prev.findIndex(p => (p._id || p.id) === (data._id || data.id));
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = data;
        return updated;
      }
      return [...prev, data];
    });
  };

  const handleOrderRealTimeUpdate = (data) => {
    setOrders(prev => {
      const index = prev.findIndex(o => (o._id || o.id) === (data._id || data.id));
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = data;
        return updated;
      }
      return [...prev, data];
    });
    
    // Refresh financial data if order is paid
    if (data.status === 'Paid' || data.paymentStatus === 'Paid') {
      refreshFinancialData?.();
    }
  };

  const handleStockRealTimeUpdate = (data) => {
    setProducts(prev => 
      prev.map(p => 
        (p._id === data.productId || p.id === data.productId)
          ? { ...p, stockQuantity: data.stockQuantity }
          : p
      )
    );
  };

  // Enhanced product submit handler
  const handleProductSubmit = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/products', productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setProducts(prev => [...prev, response.data]);
      setIsAddProductOpen(false);
      toast.success('Product added successfully with images!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add product');
    }
  };

  // Enhanced order submit handler
  const handleOrderSubmit = async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setOrders(prev => [...prev, response.data]);
      setIsAddOrderOpen(false);
      toast.success('Order created successfully!');
      
      if (response.data.status === 'Paid' || response.data.paymentStatus === 'Paid') {
        refreshFinancialData?.();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create order');
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

  // Loading fallback
  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">E-Commerce Dashboard</h1>
          <p className="text-muted-foreground">Manage your online store and orders</p>
          {/* Real-Time Sync Status */}
          <div className="mt-2">
            <Suspense fallback={null}>
              <RealTimeSync
                onProductUpdate={handleProductRealTimeUpdate}
                onOrderUpdate={handleOrderRealTimeUpdate}
                onStockUpdate={handleStockRealTimeUpdate}
              />
            </Suspense>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            className="gap-2 bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsAddOrderOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            Create Order
          </Button>
          <Button
            variant="default"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              if (user?.inviteCode) {
                window.location.href = `/store/${user.inviteCode}`;
              } else {
                setActiveView('products');
                toast.info('View your products and generate an invite link');
              }
            }}
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
              if (user?.inviteCode) {
                window.open(`/store/${user.inviteCode}`, '_blank');
                toast.success('Opening your store in a new tab...');
              } else {
                // Generate invite code first
                toast.info('Generate an invite link first to access your store');
              }
            }}
          >
            <Eye className="h-4 w-4" />
            View Store
          </Button>
          <Button 
            className="gap-2 bg-green-500 hover:bg-green-400"
            onClick={() => setIsAddProductOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant={activeView === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveView('overview')}
          className="gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Overview
        </Button>
        <Button
          variant={activeView === 'products' ? 'default' : 'ghost'}
          onClick={() => setActiveView('products')}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Products ({products.length})
        </Button>
        <Button
          variant={activeView === 'analytics' ? 'default' : 'ghost'}
          onClick={() => setActiveView('analytics')}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Analytics
        </Button>
      </div>

      {/* Quick Actions - Always visible */}
      <Suspense fallback={<LoadingFallback />}>
        <QuickActions
          onAddProduct={() => setIsAddProductOpen(true)}
          onImport={handleImportProducts}
          onExport={handleExportData}
          onGenerateReport={handleGenerateReport}
        />
      </Suspense>

      {/* Conditional Views */}
      {activeView === 'overview' && (
        <>
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

          {/* Order Timeline */}
          <Suspense fallback={<LoadingFallback />}>
            <OrderTimeline orders={orders} limit={15} />
          </Suspense>
        </>
      )}

      {/* Products View */}
      {activeView === 'products' && (
        <Suspense fallback={<LoadingFallback />}>
          <ProductCatalog
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onView={handleViewProduct}
          />
        </Suspense>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div id="analytics-section" className="space-y-4">
          {/* Time Frame Selector */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Sales Analytics</h3>
                  <p className="text-sm text-muted-foreground">View your sales performance and trends</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="timeframe" className="text-sm">Time Period:</Label>
                  <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger id="timeframe" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Suspense fallback={<LoadingFallback />}>
            <SalesAnalytics orders={orders} timeFrame={timeFrame} />
          </Suspense>
        </div>
      )}

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

      {/* Enhanced Product Form */}
      <Suspense fallback={<LoadingFallback />}>
        <EnhancedProductForm
          isOpen={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
          onSubmit={handleProductSubmit}
          initialData={editProduct}
          mode={editProduct ? 'edit' : 'add'}
        />
      </Suspense>

      {/* Enhanced Order Form */}
      <Suspense fallback={<LoadingFallback />}>
        <EnhancedOrderForm
          isOpen={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          onSubmit={handleOrderSubmit}
          products={products}
          mode="add"
        />
      </Suspense>
    </div>
  );
};

export default ECommerce;