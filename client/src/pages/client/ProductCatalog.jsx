import { useState } from "react";
import { Search, Filter, ShoppingCart, Plus, Minus, Euro, Heart } from "lucide-react";
// Assuming these are globally available (or locally defined for the file generation environment)
const Button = ({ children, onClick, className, variant = "default", size = "md" }) => <button onClick={onClick} className={`p-2 rounded-lg ${variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'} ${className}`}>{children}</button>;
const Input = ({ value, onChange, placeholder, className }) => <input value={value} onChange={onChange} placeholder={placeholder} className={`border p-2 rounded-lg w-full ${className}`} />;
const Card = ({ children, className }) => <div className={`bg-white shadow-xl rounded-xl p-4 ${className}`}>{children}</div>;
const CardHeader = ({ children, className }) => <div className={`mb-3 ${className}`}>{children}</div>;
const CardContent = ({ children, className }) => <div className={`mb-3 ${className}`}>{children}</div>;
const CardFooter = ({ children, className }) => <div className={`pt-4 border-t border-gray-100 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }) => <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>;
const CardDescription = ({ children, className }) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
const Badge = ({ children, className, variant = "default" }) => <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${variant === 'outline' ? 'border border-gray-300 text-gray-700' : 'bg-gray-200 text-gray-800'} ${className}`}>{children}</span>;

// Mock implementations for Select components, as full re-implementation is verbose
const Select = ({ value, onValueChange, children }) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)} className="w-full sm:w-48 p-2 border rounded-lg">
    {children}
  </select>
);
const SelectTrigger = ({ children }) => <>{children}</>;
const SelectValue = ({ placeholder }) => <>{placeholder}</>;
const SelectContent = ({ children }) => <>{children}</>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

// Mock toast for simple notifications
const toast = {
  success: (message) => console.log(`SUCCESS: ${message}`),
  info: (message) => console.log(`INFO: ${message}`),
  error: (message) => console.error(`ERROR: ${message}`),
};


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
  // Cart state initialization (no type annotations needed in JSX)
  const [cart, setCart] = useState([]);

  // Filter products based on search query and category filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Add a product to the cart or increment its quantity
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
    // Placeholder for real toast notification
    toast.success(`${product.name} added to cart`);
  };

  // Update quantity of an item in the cart
  const updateQuantity = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + delta }
          : item
      ).filter(item => item.quantity > 0); // Remove item if quantity drops to 0 or less
    });
  };

  // Calculate total price and item count
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      
      {/* Header and Cart Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Spa Catalog</h1>
          <p className="text-lg text-gray-500">Browse our services and exclusive retail products</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-xl py-3 px-6 bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors">
            <ShoppingCart className="h-5 w-5 mr-3" />
            {cartItemsCount} {cartItemsCount === 1 ? 'Item' : 'Items'}
          </Badge>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="shadow-lg border-2 border-primary/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                placeholder="Search products or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 h-10 border-gray-300 focus:border-primary">
                <Filter className="h-4 w-4 mr-2 text-primary" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id} 
            className="hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between overflow-hidden border-2 border-gray-100 hover:border-primary/50"
          >
            <CardHeader className="text-center">
              {/* Product Image/Emoji */}
              <div className="text-6xl mb-4 p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center border-2 border-gray-200">
                {product.image}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">{product.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{product.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                {/* Price */}
                <div className="text-3xl font-extrabold text-primary flex items-center">
                  <span className="text-xl">KES</span> {product.price.toLocaleString()}
                </div>
                {/* Stock/Status Badge */}
                <Badge className={`py-1 px-3 ${product.category === 'Services' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {product.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 font-medium">{product.stock}</p>
            </CardContent>
            
            <CardFooter>
              <Button
                onClick={() => addToCart(product)}
                className="w-full bg-primary hover:bg-primary/90 transition-colors py-2 text-lg font-semibold"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.category === 'Services' ? 'Book Now' : 'Add to Cart'}
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {/* Empty Search State */}
        {filteredProducts.length === 0 && (
          <div className="lg:col-span-3 text-center p-12 bg-white rounded-xl shadow-inner text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <p className="text-xl font-semibold">No results found.</p>
            <p>Try adjusting your search or filter settings.</p>
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card className="border-4 border-primary/50 shadow-2xl mt-12">
          <CardHeader className="bg-primary/10 p-6 rounded-t-xl">
            <CardTitle className="text-2xl flex items-center text-primary">
              <ShoppingCart className="h-6 w-6 mr-3" />
              Shopping Cart Summary ({cartItemsCount} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 last:border-b-0">
                <div className="flex-1 mb-2 sm:mb-0">
                  <p className="font-semibold text-lg text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    KES {item.price.toLocaleString()} each
                  </p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 border-r rounded-none bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-lg text-gray-800">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 border-l rounded-none bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Item Subtotal */}
                  <div className="w-24 text-right font-extrabold text-xl text-green-600">
                    KES {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 bg-primary/5 rounded-b-xl">
            <div className="w-full flex justify-between items-center text-2xl font-extrabold">
              <span>Order Total:</span>
              <span className="text-primary">KES {cartTotal.toLocaleString()}</span>
            </div>
            <Button className="w-full bg-green-500 hover:bg-green-600 transition-colors text-white py-3 text-lg font-bold shadow-md" size="lg">
              Proceed to Checkout
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ProductCatalog;
