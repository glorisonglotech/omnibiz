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
  Eye, 
  Edit, 
  Trash2, 
  Star,
  Heart,
  Share2
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
  const [editProduct, setEditProduct] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    featured: false,
    supplierName: ''
  });

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const dbProducts = response.data;

      if (dbProducts.length === 0) {
        toast.info('No products found in the database.');
        setProducts([]);
        setFilteredProducts([]);
      } else {
        const transformedProducts = dbProducts.map(product => ({
          id: product._id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category,
          stock: product.stockQuantity || 0,
          image: product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
          featured: product.featured || false,
          rating: product.rating || 4.5,
          reviews: product.reviews || Math.floor(Math.random() * 100),
          sku: product.sku,
          supplierName: product.supplierName,
          status: product.status
        }));

        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products. Please try again.');
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

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

  const toggleWishlist = async (product) => {
    try {
      const isInWishlist = wishlist.find(item => item.id === product.id);
      if (isInWishlist) {
        setWishlist(wishlist.filter(item => item.id !== product.id));
        toast.success(`${product.name} removed from wishlist`);
        await api.delete(`/wishlist/${product.id}`);
      } else {
        setWishlist([...wishlist, product]);
        toast.success(`${product.name} added to wishlist!`);
        await api.post('/wishlist', { productId: product.id });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist. Please try again.');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stockQuantity: parseInt(newProduct.stock) || 0,
        sku: `SKU-${Date.now()}`,
        supplierName: newProduct.supplierName || 'Default Supplier',
        image: newProduct.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        featured: newProduct.featured
      };

      await api.post('/products', productData);
      await fetchProducts();
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

  const handleEditProduct = async () => {
    if (!editProduct.name || !editProduct.price || !editProduct.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        name: editProduct.name,
        description: editProduct.description,
        price: parseFloat(editProduct.price),
        category: editProduct.category,
        stockQuantity: parseInt(editProduct.stock) || 0,
        supplierName: editProduct.supplierName || 'Default Supplier',
        image: editProduct.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        featured: editProduct.featured
      };

      await api.put(`/products/${editProduct.id}`, productData);
      await fetchProducts();
      setEditProduct({
        id: '',
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: '',
        featured: false,
        supplierName: ''
      });
      setIsEditDialogOpen(false);
      toast.success('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      await fetchProducts();
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  const openEditDialog = (product) => {
    setEditProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image,
      featured: product.featured,
      supplierName: product.supplierName
    });
    setIsEditDialogOpen(true);
  };

  const ProductCard = ({ product }) => {
  const isWishlisted = isInWishlist(product.id);
  const rating = Math.floor(product.rating || 0);

  return (
    <Card className="group bg-white/30 backdrop-blur-md border border-green-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={product.image || '/placeholder.jpg'}
          alt={product.name || 'Product image'}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {product.featured && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs font-medium">
            Featured
          </Badge>
        )}

        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
              isWishlisted ? 'bg-green-100 text-green-600' : ''
            }`}
            onClick={() => toggleWishlist(product)}
            aria-label="Toggle wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              setSelectedProduct(product);
              setIsProductDetailOpen(true);
            }}
            aria-label="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <Badge variant="outline" className="text-xs border-green-300 text-green-600">
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
                className={`h-4 w-4 ${
                  i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({product.reviews || 0})</span>
        </div>

        {/* Price on its own line */}
        <div>
          <p className="text-2xl font-bold text-green-600">
            KES {product.price.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
        </div>

        {/* Edit/Delete buttons below price */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditDialog(product)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteProduct(product.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

  return (
    <div className="space-y-6">
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
                    onClick={() => openEditDialog(selectedProduct)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                value={editProduct.name}
                onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editProduct.description}
                onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                placeholder="Product description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (KES) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({...editProduct, stock: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={editProduct.category} onValueChange={(value) => setEditProduct({...editProduct, category: value})}>
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
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={editProduct.image}
                onChange={(e) => setEditProduct({...editProduct, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="edit-supplierName">Supplier Name</Label>
              <Input
                id="edit-supplierName"
                value={editProduct.supplierName}
                onChange={(e) => setEditProduct({...editProduct, supplierName: e.target.value})}
                placeholder="Enter supplier name"
              />
            </div>
            <Button onClick={handleEditProduct} className="w-full">
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;