import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Search, Filter, Plus, Minus, Trash2, Package, User, LogOut, History, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductDetailDialog  from "@/components/storefront/ProductDetailDialog";
import CheckoutFlow  from "@/components/storefront/CheckoutFlow";
import  OrderHistory  from "@/components/storefront/OrderHistory";
import  LiveChatWidget  from "@/components/storefront/LiveChatWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClientStorefront = () => {
  const { inviteCode } = useParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState("shop");

  // Simulated store owner info
  const storeOwner = {
    businessName: "Premium Beauty Store",
    ownerName: "Sarah Johnson",
  };

  // Simulated products with enhanced details (will be fetched from backend)
  const products = [
    {
      id: "1",
      name: "Premium Hair Shampoo",
      description: "Nourishing shampoo for all hair types with natural ingredients",
      price: 30,
      category: "Hair Care",
      stock: 25,
      image: "/placeholder.svg",
      rating: 4.8,
      specs: ["250ml bottle", "Sulfate-free", "pH balanced", "Natural ingredients"],
      reviews: [
        { id: "r1", author: "Jane Doe", rating: 5, comment: "Best shampoo I've ever used!", date: "2025-10-10" },
        { id: "r2", author: "John Smith", rating: 4, comment: "Great product, will buy again", date: "2025-10-08" },
      ],
    },
    {
      id: "2",
      name: "Hair Styling Gel",
      description: "Strong hold gel with natural finish and no residue",
      price: 16,
      category: "Hair Care",
      stock: 40,
      image: "/placeholder.svg",
      rating: 4.5,
      specs: ["150ml", "Water-based", "Easy wash out", "Long-lasting hold"],
      reviews: [
        { id: "r3", author: "Mike Johnson", rating: 5, comment: "Perfect hold without being sticky", date: "2025-10-12" },
      ],
    },
    {
      id: "3",
      name: "Organic Face Mask",
      description: "Deep cleansing and hydrating mask with organic ingredients",
      price: 45,
      category: "Skincare",
      stock: 15,
      image: "/placeholder.svg",
      rating: 4.9,
      specs: ["100ml", "Organic certified", "Vegan", "Cruelty-free"],
      reviews: [
        { id: "r4", author: "Sarah Lee", rating: 5, comment: "My skin feels amazing!", date: "2025-10-11" },
      ],
    },
    {
      id: "4",
      name: "Professional Hair Dryer",
      description: "Fast drying with heat protection and ionic technology",
      price: 200,
      category: "Tools",
      stock: 8,
      image: "/placeholder.svg",
      rating: 4.7,
      specs: ["2200W", "Ionic technology", "3 heat settings", "Cool shot button"],
      reviews: [
        { id: "r5", author: "Emily White", rating: 5, comment: "Salon quality at home!", date: "2025-10-09" },
      ],
    },
    {
      id: "5",
      name: "Moisturizing Cream",
      description: "24-hour hydration with SPF 15 protection",
      price: 35,
      category: "Skincare",
      stock: 30,
      image: "/placeholder.svg",
      rating: 4.6,
      specs: ["50ml", "SPF 15", "Non-greasy", "Suitable for all skin types"],
      reviews: [],
    },
    {
      id: "6",
      name: "Hair Brush Set",
      description: "Professional quality brushes for all hair types",
      price: 28,
      category: "Tools",
      stock: 20,
      image: "/placeholder.svg",
      rating: 4.4,
      specs: ["3-piece set", "Bamboo handle", "Anti-static bristles", "Ergonomic design"],
      reviews: [],
    },
  ];

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
        toast({
          title: "Updated cart",
          description: `${product.name} quantity increased`,
        });
      } else {
        toast({
          title: "Stock limit reached",
          description: `Only ${product.stock} available`,
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast({
        title: "Added to cart! 🛍️",
        description: `${product.name} added to your cart`,
      });
    }
  };

  const updateQuantity = (productId, change) => {
    const item = cart.find((item) => item.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.stock) {
      toast({
        title: "Stock limit reached",
        description: `Only ${item.stock} available`,
        variant: "destructive",
      });
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    const item = cart.find((item) => item.id === productId);
    setCart(cart.filter((item) => item.id !== productId));
    if (item) {
      toast({
        title: "Removed from cart",
        description: `${item.name} removed`,
      });
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background smooth-scroll">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{storeOwner.businessName}</h1>
                <p className="text-xs text-muted-foreground">by {storeOwner.ownerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "orders" ? "default" : "ghost"}
                size="icon"
                onClick={() => setActiveTab("orders")}
                className="hidden sm:flex"
              >
                <History className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="shop">Shop</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-6">
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                Secure Payment
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <Package className="h-4 w-4 text-primary" />
                Fast Delivery
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-warning" />
                7-Day Returns
              </Badge>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-panel"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] glass-panel">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-lg border-white/20">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="gap-2 relative">
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center badge-pulse">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto glass-panel">
                    <SheetHeader>
                      <SheetTitle>Shopping Cart</SheetTitle>
                      <SheetDescription>
                        {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in your cart
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {cart.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Your cart is empty</p>
                        </div>
                      ) : (
                        <>
                          {cart.map((item) => (
                            <Card key={item.id} className="glass-card">
                              <CardContent className="p-4">
                                <div className="flex gap-4">
                                  <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      KES {item.price.toFixed(2)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={() => updateQuantity(item.id, -1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-medium w-8 text-center">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={() => updateQuantity(item.id, 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 ml-auto"
                                        onClick={() => removeFromCart(item.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold mb-4">
                              <span>Total:</span>
                              <span>KES {cartTotal.toFixed(2)}</span>
                            </div>
                            <Button className="w-full" size="lg" onClick={handleCheckout}>
                              Proceed to Checkout
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="group glass-card cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-secondary/30 to-primary/10 rounded-t-lg flex items-center justify-center overflow-hidden">
                      <Package className="h-20 w-20 text-primary/40 product-card-image" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
                      <Badge variant={product.stock > 10 ? "default" : "secondary"} className="shrink-0">
                        {product.stock} left
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        KES {product.price.toFixed(2)}
                      </span>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <OrderHistory />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals and Widgets */}
      <ProductDetailDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
      
      <CheckoutFlow
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cart}
        cartTotal={cartTotal}
        onClearCart={clearCart}
      />

      <LiveChatWidget />
    </div>
  );
};

export default ClientStorefront;