import { useState, useEffect } from "react";
import { toast } from "sonner"; // Import Sonner's toast functionality
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  QrCode,
  DollarSign,
  Send,
} from "lucide-react";
import api from "@/lib/api";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    stock: "",
    reorderLevel: "",
    price: "",
    supplier: "",
    description: "",
  });

  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Fetch products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");

        // If no token is available, we could show an error or redirect to login
        if (!token) {
          toast.error("Please log in to view your products."); // Display error notification
          return;
        }

        // Send the request with the token in the Authorization header
        const response = await api.get("/products", {
          headers: {
            Authorization: `Bearer ${token}`, // Send JWT token to backend for authorization
          },
        });

        setProducts(response.data); // Update the state with the fetched products
      } catch (error) {
        if (error.response) {
          // The request was made, and the server responded with an error
          const status = error.response.status;
          const message =
            error.response.data?.message || "Error fetching products";

          if (status === 401) {
            toast.error("Unauthorized: Please log in again."); // Handle unauthorized error (e.g., expired token)
          } else if (status === 500) {
            toast.error("Server error: Please try again later."); // Handle server error
          } else {
            toast.error(message); // Display specific error message from server
          }

          console.error("Error fetching products:", error.response); // Log detailed response error for debugging
        } else if (error.request) {
          // The request was made but no response was received
          toast.error("Network error: Please check your internet connection.");
          console.error("Error request:", error.request);
        } else {
          // Something happened in setting up the request
          toast.error("Unexpected error occurred: Please try again.");
          console.error("Error:", error.message);
        }
      }
    };

    fetchProducts();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  const handleNewProductChange = (field, value) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add product to the backend
  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.sku ||
      !newProduct.category ||
      !newProduct.stock ||
      !newProduct.price ||
      !newProduct.supplier
    ) {
      toast.error("Please fill in all required fields."); // Show validation error
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      const response = await api.post("/products", newProduct, {
        headers: {
          Authorization: `Bearer ${token}`, // Send JWT token to backend for authorization
        },
      });
      setProducts((prev) => [...prev, response.data]); // Update the state with the new product
      setNewProduct({
        name: "",
        sku: "",
        category: "",
        stock: "",
        reorderLevel: "",
        price: "",
        supplier: "",
        description: "",
      });
      setIsAddProductOpen(false); // Close the dialog after adding the product
      toast.success("Product added successfully!"); // Success notification
    } catch (error) {
      toast.error("Error adding product."); // Show an error notification
      console.error("Error adding product:", error);
    }
  };

  // Edit product handlers
  const handleEditClick = (product) => {
    setEditProduct({ ...product });
    setIsEditProductOpen(true);
  };

  const handleEditProductChange = (field, value) => {
    setEditProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProduct = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      const response = await api.put(
        `/products/${editProduct.id}`,
        editProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send JWT token to backend for authorization
          },
        }
      );
      setProducts(
        (prev) =>
          prev.map((p) => (p.id === response.data.id ? response.data : p)) // Update the state with the updated product
      );
      setIsEditProductOpen(false);
      setEditProduct(null);
      toast.success("Product updated successfully!"); // Success notification
    } catch (error) {
      toast.error("Error updating product."); // Show an error notification
      console.error("Error updating product:", error);
    }
  };

  const getStatusBadge = (status, stock, reorderLevel) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock <= reorderLevel) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Card Calculations (Total Products, Low Stock, Out of Stock, Total Value)
  const totalProducts = products.length;
  const lowStockItems = products.filter(
    (p) => p.stock <= p.reorderLevel && p.stock > 0
  ).length;
  const outOfStockItems = products.filter((p) => p.stock === 0).length;
  const totalValue = products
    .reduce((sum, p) => sum + p.price * p.stock, 0)
    .toLocaleString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage your products, stock levels, and suppliers
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            Scan Barcode
          </Button>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 cursor-pointer hover:bg-green-400">
                <Plus className="mr-2 h-4 w-4" />
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
                      value={newProduct.stock}
                      onChange={(e) =>
                        handleNewProductChange("stock", e.target.value)
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
                      value={newProduct.supplier}
                      onChange={(e) =>
                        handleNewProductChange("supplier", e.target.value)
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
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Require restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue}</div>
            <p className="text-xs text-muted-foreground">Inventory worth</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>View and manage all your products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Hair Care">Hair Care</SelectItem>
                <SelectItem value="Skincare">Skincare</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.supplier}</TableCell>
                  <TableCell>
                    {getStatusBadge(
                      product.status,
                      product.stock,
                      product.reorderLevel
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {isEditProductOpen && editProduct && (
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Add input fields for editing products here */}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="text-red-500 cursor-pointer hover:text-red-400"
                onClick={() => setIsEditProductOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-500 cursor-pointer hover:bg-green-400"
                onClick={handleUpdateProduct}
              >
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

export default Inventory;
