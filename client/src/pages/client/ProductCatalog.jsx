import { useState } from "react";
import { Search, Filter, ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock products data
const products = [
  {
    id: 1,
    name: "Premium Hair Treatment",
    category: "Services",
    price: 2500,
    image: "💇",
    description: "Professional hair treatment with organic products",
    stock: "Available"
  },
  {
    id: 2,
    name: "Manicure & Pedicure",
    category: "Services",
    price: 1500,
    image: "💅",
    description: "Complete nail care service",
    stock: "Available"
  },
  {
    id: 3,
    name: "Organic Shampoo",
    category: "Products",
    price: 800,
    image: "🧴",
    description: "Natural ingredients for healthy hair",
    stock: "In Stock"
  },
  {
    id: 4,
    name: "Face Massage",
    category: "Services",
    price: 2000,
    image: "💆",
    description: "Relaxing facial massage therapy",
    stock: "Available"
  },
  {
    id: 5,
    name: "Hair Dryer Pro",
    category: "Products",
    price: 3500,
    image: "🔌",
    description: "Professional grade hair dryer",
    stock: "In Stock"
  },
  {
    id: 6,
    name: "Spa Package",
    category: "Services",
    price: 5000,
    image: "🌸",
    description: "Full day spa experience",
    stock: "Available"
  },
];

const ProductCatalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cart, setCart] = useState([]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Catalog</h1>
          <p className="text-muted-foreground">Browse our products and services</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg py-2 px-4">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {cartItemsCount} items
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Products">Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="card-hover">
            <CardHeader>
              <div className="text-5xl mb-4 text-center">{product.image}</div>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-primary">
                  KES {product.price.toLocaleString()}
                </div>
                <Badge variant="outline">{product.stock}</Badge>
              </div>
              <Badge className="mt-2">{product.category}</Badge>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => addToCart(product)}
                className="w-full"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Shopping Cart ({cartItemsCount} items)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    KES {item.price.toLocaleString()} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="w-32 text-right font-bold">
                    KES {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary">KES {cartTotal.toLocaleString()}</span>
            </div>
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ProductCatalog;