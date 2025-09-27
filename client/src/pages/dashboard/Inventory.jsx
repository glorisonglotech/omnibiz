import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
    stockQuantity: "",
    reorderLevel: "",
    price: "",
    supplierName: "",
    description: "",
  });
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

  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view your products.");
        return;
      }

      try {
        const response = await api.get("/products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Unauthorized: Please log in again.");
        } else {
          toast.error("Error fetching products. Please try again later.");
        }
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

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
      stock: Number(newProduct.stockQuantity),
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

      setProducts((prev) => [...prev, response.data]);
      setNewProduct(defaultProduct);
      setIsAddProductOpen(false);
      toast.success("Product added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error adding product.");
      console.error("Error adding product:", error);
    }
  };

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
    if (!editProduct) return;

    const sanitizedEdit = {
      ...editProduct,
      stockQuantity: Number(editProduct.stockQuantity),
      reorderLevel: Number(editProduct.reorderLevel),
      price: Number(editProduct.price),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/products/${editProduct._id}`,
        sanitizedEdit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setProducts((prev) =>
        prev.map((p) => (p._id === response.data._id ? response.data : p))
      );
      setIsEditProductOpen(false);
      setEditProduct(null);
      toast.success("Product updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error updating product.");
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error deleting product.");
      console.error("Error deleting product:", error);
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
    (p) => p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0
  ).length;
  const outOfStockItems = products.filter((p) => p.stockQuantity === 0).length;
  const totalValue = products
    .reduce((sum, p) => sum + p.price * p.stockQuantity, 0)
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
                  <TableCell>{product.stockQuantity}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.supplierName}</TableCell>
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
              <div className="grid gap-2">
                <Label htmlFor="edit-product-name">Product Name</Label>
                <Input
                  id="edit-product-name"
                  placeholder="Enter product name"
                  value={editProduct?.name ?? ""}
                  onChange={(e) =>
                    handleEditProductChange("name", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  placeholder="Product SKU"
                  value={editProduct?.sku ?? ""}
                  onChange={(e) =>
                    handleEditProductChange("sku", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  placeholder="Enter category"
                  value={editProduct?.category ?? ""}
                  onChange={(e) =>
                    handleEditProductChange("category", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stock Quantity</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={editProduct?.stockQuantity ?? ""}
                    onChange={(e) =>
                      handleEditProductChange("stockQuantity", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
                  <Input
                    id="edit-reorderLevel"
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={editProduct?.reorderLevel ?? ""}
                    onChange={(e) =>
                      handleEditProductChange("reorderLevel", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 29.99"
                    value={editProduct?.price ?? ""}
                    onChange={(e) =>
                      handleEditProductChange("price", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-supplier">Supplier</Label>
                  <Input
                    id="edit-supplier"
                    placeholder="Supplier name"
                    value={editProduct?.supplierName ?? ""}
                    onChange={(e) =>
                      handleEditProductChange("supplierName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Product description"
                  value={editProduct?.description ?? ""}
                  onChange={(e) =>
                    handleEditProductChange("description", e.target.value)
                  }
                  className="resize-none"
                />
              </div>
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
