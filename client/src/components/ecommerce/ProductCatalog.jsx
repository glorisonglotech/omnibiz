import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Package,
  Eye
} from "lucide-react";
import { toast } from "sonner";

const ProductCatalog = ({ products = [], onEdit, onDelete, onView }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      
      const matchesStock = stockFilter === "all" ||
                          (stockFilter === "low" && product.stockQuantity <= product.reorderLevel) ||
                          (stockFilter === "out" && product.stockQuantity === 0) ||
                          (stockFilter === "in" && product.stockQuantity > product.reorderLevel);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [products]);

  // Product stats
  const stats = useMemo(() => ({
    total: products.length,
    lowStock: products.filter(p => p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0).length,
    outOfStock: products.filter(p => p.stockQuantity === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
  }), [products]);

  const getStockBadge = (product) => {
    if (product.stockQuantity === 0) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Out of Stock</Badge>;
    }
    if (product.stockQuantity <= product.reorderLevel) {
      return <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" />Low Stock</Badge>;
    }
    return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />In Stock</Badge>;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Product Catalog
            </CardTitle>
            <CardDescription>{filteredProducts.length} of {products.length} products</CardDescription>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
              <div className="text-xs text-muted-foreground">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
              <div className="text-xs text-muted-foreground">Out</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Value</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Category: {categoryFilter === "all" ? "All" : categoryFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map(cat => (
                <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)}>
                  {cat === "all" ? "All Categories" : cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Stock: {stockFilter === "all" ? "All" : stockFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Stock</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStockFilter("all")}>All Products</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStockFilter("in")}>In Stock</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStockFilter("low")}>Low Stock</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStockFilter("out")}>Out of Stock</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Products Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product._id || product.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.supplierName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${product.price?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <div className="font-semibold">{product.stockQuantity}</div>
                        <div className="text-xs text-muted-foreground">
                          Reorder: {product.reorderLevel}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStockBadge(product)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onView?.(product)} className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(product)} className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              if (confirm(`Delete ${product.name}?`)) {
                                onDelete?.(product);
                              }
                            }} 
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCatalog;
