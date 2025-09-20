import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Star, 
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
  MoreVertical
} from 'lucide-react'

function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list

  const categories = [
    { id: 'all', name: 'All Products', count: 156 },
    { id: 'electronics', name: 'Electronics', count: 45 },
    { id: 'clothing', name: 'Clothing', count: 38 },
    { id: 'home', name: 'Home & Garden', count: 29 },
    { id: 'sports', name: 'Sports', count: 22 },
    { id: 'books', name: 'Books', count: 22 }
  ]

  const products = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      category: 'Electronics',
      price: 89.99,
      stock: 45,
      rating: 4.5,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      status: 'active',
      sales: 234
    },
    {
      id: 2,
      name: 'Premium Cotton T-Shirt',
      category: 'Clothing',
      price: 24.99,
      stock: 120,
      rating: 4.3,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      status: 'active',
      sales: 156
    },
    {
      id: 3,
      name: 'Smart Home Security Camera',
      category: 'Electronics',
      price: 149.99,
      stock: 23,
      rating: 4.7,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      status: 'active',
      sales: 89
    },
    {
      id: 4,
      name: 'Ergonomic Office Chair',
      category: 'Home & Garden',
      price: 299.99,
      stock: 8,
      rating: 4.6,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      status: 'low_stock',
      sales: 45
    },
    {
      id: 5,
      name: 'Yoga Mat Premium',
      category: 'Sports',
      price: 39.99,
      stock: 67,
      rating: 4.4,
      reviews: 145,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop',
      status: 'active',
      sales: 178
    },
    {
      id: 6,
      name: 'JavaScript Programming Guide',
      category: 'Books',
      price: 34.99,
      stock: 0,
      rating: 4.8,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop',
      status: 'out_of_stock',
      sales: 267
    }
  ]

  const stats = [
    { label: 'Total Products', value: '156', icon: Package, color: 'text-blue-600' },
    { label: 'Total Sales', value: '$12,450', icon: DollarSign, color: 'text-green-600' },
    { label: 'Top Rated', value: '4.6★', icon: Star, color: 'text-yellow-600' },
    { label: 'Growth', value: '+15%', icon: TrendingUp, color: 'text-purple-600' }
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'low_stock': return 'text-yellow-600 bg-yellow-100'
      case 'out_of_stock': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'In Stock'
      case 'low_stock': return 'Low Stock'
      case 'out_of_stock': return 'Out of Stock'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
              <p className="text-muted-foreground">Manage your product catalog and inventory</p>
            </div>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 mt-4 md:mt-0">
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="bg-card p-6 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card p-6 rounded-lg border mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>

              <button className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md text-foreground hover:bg-accent">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {getStatusText(product.status)}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">{product.name}</h3>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mb-2">{product.category}</p>

                <div className="flex items-center space-x-1 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-foreground">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-foreground">${product.price}</span>
                  <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{product.sales} sold</span>
                  <div className="flex space-x-1">
                    <button className="text-primary hover:text-primary/80">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
