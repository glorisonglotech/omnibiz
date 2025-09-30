import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  ShoppingCart, 
  Eye, 
  Edit, 
  Trash2, 
  Star,
  Heart,
  Share2,
  Minus,
  ImageIcon,
  Tag,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    featured: false,
    supplierName: ''
  });

  // Sample product data with images
  const sampleProducts = [
    {
      id: 1,
      name: 'Premium Coffee Beans',
      description: 'High-quality Arabica coffee beans sourced from Ethiopian highlands. Perfect for espresso and drip coffee.',
      price: 2500,
      category: 'Beverages',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
      featured: true,
      rating: 4.8,
      reviews: 124
    },
    {
      id: 2,
      name: 'Organic Green Tea',
      description: 'Premium organic green tea leaves with antioxidants. Refreshing and healthy choice for daily consumption.',
      price: 1800,
      category: 'Beverages',
      stock: 75,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
      featured: false,
      rating: 4.6,
      reviews: 89
    },
    {
      id: 3,
      name: 'Artisan Chocolate Bar',
      description: 'Handcrafted dark chocolate bar with 70% cocoa content. Made with premium Belgian chocolate.',
      price: 1200,
      category: 'Snacks',
      stock: 30,
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop',
      featured: true,
      rating: 4.9,
      reviews: 156
    },
    {
      id: 4,
      name: 'Fresh Croissants',
      description: 'Buttery, flaky croissants baked fresh daily. Perfect for breakfast or afternoon snack.',
      price: 800,
      category: 'Bakery',
      stock: 20,
      image: 'https://images.unsplash.com/photo-1555507036-ab794f4afe5a?w=400&h=300&fit=crop',
      featured: false,
      rating: 4.7,
      reviews: 67
    },
    {
      id: 5,
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 15000,
      category: 'Electronics',
      stock: 15,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      featured: true,
      rating: 4.5,
      reviews: 203
    },
    {
      id: 6,
      name: 'Smartphone Case',
      description: 'Durable protective case for smartphones with shock absorption and wireless charging compatibility.',
      price: 3500,
      category: 'Electronics',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400&h=300&fit=crop',
      featured: false,
      rating: 4.4,
      reviews: 91
    },
    {
      id: 7,
      name: 'Organic Honey',
      description: 'Pure organic honey harvested from local beekeepers. Rich in antioxidants and natural enzymes.',
      price: 2200,
      category: 'Food',
      stock: 25,
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
      featured: true,
      rating: 4.9,
      reviews: 78
    },
    {
      id: 8,
      name: 'Bluetooth Speaker',
      description: 'Portable wireless speaker with premium sound quality and 12-hour battery life.',
      price: 8500,
      category: 'Electronics',
      stock: 18,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
      featured: false,
      rating: 4.6,
      reviews: 142
    },
    {
      id: 9,
      name: 'Cotton T-Shirt',
      description: 'Premium 100% cotton t-shirt with comfortable fit and durable fabric. Available in multiple colors.',
      price: 1800,
      category: 'Clothing',
      stock: 60,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
      featured: false,
      rating: 4.3,
      reviews: 95
    },
    {
      id: 10,
      name: 'Notebook Set',
      description: 'Set of 3 premium notebooks with lined pages, perfect for journaling and note-taking.',
      price: 1200,
      category: 'Stationery',
      stock: 35,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
      featured: false,
      rating: 4.5,
      reviews: 67
    },
    {
      id: 11,
      name: 'Fitness Tracker',
      description: 'Smart fitness tracker with heart rate monitoring, sleep tracking, and 7-day battery life.',
      price: 12000,
      category: 'Electronics',
      stock: 12,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=300&fit=crop',
      featured: true,
      rating: 4.7,
      reviews: 189
    },
    {
      id: 12,
      name: 'Ceramic Mug',
      description: 'Handcrafted ceramic mug with unique design. Perfect for coffee, tea, or hot chocolate.',
      price: 800,
      category: 'Home & Kitchen',
      stock: 45,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop',
      featured: false,
      rating: 4.4,
      reviews: 56
    }
  ];

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const dbProducts = response.data;

      // If no products in database, use sample data
      if (dbProducts.length === 0) {
        setProducts(sampleProducts);
        setFilteredProducts(sampleProducts);
        toast.info('No products found. Showing sample data.');
      } else {
        // Transform database products to match frontend format
        const transformedProducts = dbProducts.map(product => ({
          id: product._id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category,
          stock: product.stockQuantity || 0,
          image: product.image || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop`,
          featured: false,
          rating: 4.5,
          reviews: Math.floor(Math.random() * 100),
          sku: product.sku,
          supplierName: product.supplierName,
          status: product.status
        }));
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products. Showing sample data.');
      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter and sort products
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.find(item => item.id === product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      toast.success(`${product.name} removed from wishlist`);
    } else {
      setWishlist([...wishlist, product]);
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Item removed from cart');
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Prepare product data for API
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stockQuantity: parseInt(newProduct.stock) || 0,
        sku: `SKU-${Date.now()}`, // Generate unique SKU
        supplierName: newProduct.supplierName || 'Default Supplier',
        image: newProduct.image || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop`
      };

      // Save to database
      const response = await api.post('/products', productData);

      // Refresh products list
      await fetchProducts();

      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: '',
        featured: false,
        supplierName: ''
      });
      setIsAddDialogOpen(false);
      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      await fetchProducts(); // Refresh the list
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  const ProductCard = ({ product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-card border-border">
      <div className="relative overflow-hidden">
        <img 
          src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.featured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
              isInWishlist(product.id) ? 'bg-red-100 text-red-600' : ''
            }`}
            onClick={() => toggleWishlist(product)}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              setSelectedProduct(product);
              setIsProductDetailOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviews || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">
                KES {product.price.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Stock: {product.stock}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteProduct(product.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product for your catalog
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Product description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (KES) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Snacks">Snacks</SelectItem>
                      <SelectItem value="Bakery">Bakery</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Clothing">Clothing</SelectItem>
                      <SelectItem value="Books">Books</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    value={newProduct.supplierName}
                    onChange={(e) => setNewProduct({...newProduct, supplierName: e.target.value})}
                    placeholder="Enter supplier name"
                  />
                </div>
                <Button onClick={handleAddProduct} className="w-full">
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Dialog open={isProductDetailOpen} onOpenChange={setIsProductDetailOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Product details and specifications
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Badge variant="outline">{selectedProduct.category}</Badge>
                  {selectedProduct.featured && (
                    <Badge className="ml-2">Featured</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{selectedProduct.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(selectedProduct.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-primary">
                    KES {selectedProduct.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {selectedProduct.stock} available
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => addToCart(selectedProduct)}
                    disabled={selectedProduct.stock === 0}
                    className="flex-1"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toggleWishlist(selectedProduct)}
                    className={isInWishlist(selectedProduct.id) ? 'bg-red-50 text-red-600' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(selectedProduct.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Shopping Cart Summary */}
      {cart.length > 0 && (
        <Card className="fixed bottom-4 right-4 w-80 bg-card border-border shadow-lg z-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-40 overflow-y-auto space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="flex-1 truncate">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 w-6 p-0"
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 w-6 p-0"
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>KES {getTotalCartValue().toLocaleString()}</span>
              </div>
              <Button className="w-full mt-2" onClick={() => {
                navigate('/dashboard/checkout');
              }}>
                Proceed to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Products;
