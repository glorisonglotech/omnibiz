import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search as SearchIcon, 
  Filter, 
  Clock, 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  FileText,
  MapPin,
  Calendar,
  Eye,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { searchAPI } from '@/lib/apiHelpers';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({
    products: [],
    orders: [],
    customers: [],
    transactions: [],
    locations: [],
    appointments: [],
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch real data from multiple endpoints
      const [productsRes, ordersRes, customersRes] = await Promise.allSettled([
        searchAPI.searchByCategory('products', searchQuery),
        searchAPI.searchByCategory('orders', searchQuery),
        searchAPI.searchByCategory('customers', searchQuery)
      ]);

      const apiResults = {
        products: productsRes.status === 'fulfilled' ? productsRes.value : [],
        orders: ordersRes.status === 'fulfilled' ? ordersRes.value : [],
        customers: customersRes.status === 'fulfilled' ? customersRes.value : [],
        transactions: [],
        locations: [],
        appointments: [],
        documents: []
      };

      // Set results from database
      setResults(apiResults);
      
      // Calculate total from API results
      const apiTotal = Object.values(apiResults).reduce((sum, arr) => sum + (arr?.length || 0), 0);
      setTotalResults(apiTotal);
      
      if (apiTotal > 0) {
        toast.success(`Found ${apiTotal} results for "${searchQuery}"`);
      } else {
        toast.info('No results found. Try different keywords.');
      }
    } catch (error) {
      console.error('Search API error:', error);
      toast.error('Search failed. Please check your connection and try again.');
      // Set empty results on error
      setResults({
        products: [],
        orders: [],
        customers: [],
        transactions: [],
        locations: [],
        appointments: [],
        documents: []
      });
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const searchCategories = [
    { id: 'all', label: 'All Results', icon: SearchIcon, count: totalResults },
    { id: 'products', label: 'Products', icon: Package, count: results.products?.length || 0 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, count: results.orders?.length || 0 },
    { id: 'customers', label: 'Customers', icon: Users, count: results.customers?.length || 0 },
    { id: 'transactions', label: 'Transactions', icon: DollarSign, count: results.transactions?.length || 0 },
    { id: 'locations', label: 'Locations', icon: MapPin, count: results.locations?.length || 0 },
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: results.appointments?.length || 0 },
    { id: 'documents', label: 'Documents', icon: FileText, count: results.documents?.length || 0 }
  ];

  const handleResultClick = (item, type) => {
    // Navigate to appropriate page based on result type
    switch(type) {
      case 'products':
        navigate('/dashboard/inventory');
        toast.success(`Viewing product: ${item.name}`);
        break;
      case 'orders':
        navigate('/dashboard/ecommerce');
        toast.success(`Viewing order: ${item.id}`);
        break;
      case 'customers':
        navigate('/dashboard/ecommerce');
        toast.success(`Viewing customer: ${item.name}`);
        break;
      case 'transactions':
        navigate('/dashboard/finances');
        toast.success(`Viewing transaction: ${item.id}`);
        break;
      case 'locations':
        navigate('/dashboard/locations');
        toast.success(`Viewing location: ${item.name}`);
        break;
      case 'appointments':
        navigate('/dashboard/appointments');
        toast.success(`Viewing appointment with ${item.client}`);
        break;
      case 'documents':
        navigate('/dashboard/reports');
        toast.success(`Viewing document: ${item.name}`);
        break;
      default:
        toast.info('Opening details...');
    }
  };

  const ResultCard = ({ item, type }) => (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => handleResultClick(item, type)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              {item.name || item.client || item.customer || `${type.toUpperCase()} #${item.id}`}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {type === 'products' && `${item.category} • $${item.price} • Stock: ${item.stock}`}
              {type === 'orders' && `${item.customer} • $${item.total} • ${item.status}`}
              {type === 'customers' && `${item.email} • ${item.orders} orders • $${item.totalSpent}`}
              {type === 'transactions' && `${item.type} • $${Math.abs(item.amount)} • ${item.description}`}
              {type === 'locations' && `${item.address}, ${item.city} • ${item.status}`}
              {type === 'appointments' && `${item.service} • ${item.date} at ${item.time}`}
              {type === 'documents' && `${item.type} • ${item.date} • ${item.size}`}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SearchIcon className="h-8 w-8 text-green-600" />
            Search Results
          </h1>
          <p className="text-muted-foreground">
            {query ? `Results for "${query}"` : 'Search across all modules and data'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, orders, customers, and more..."
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {searchCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={activeTab === category.id ? "default" : "outline"}
              className="h-auto p-3 flex flex-col items-center gap-1"
              onClick={() => setActiveTab(category.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{category.label}</span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Results */}
      {totalResults > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="all" className="space-y-4">
            {Object.entries(results).map(([type, items]) => 
              items.length > 0 && (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="capitalize">{type} ({items.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.slice(0, 3).map((item, index) => (
                      <ResultCard 
                        key={index} 
                        item={item} 
                        type={type}
                      />
                    ))}
                    {items.length > 3 && (
                      <Button variant="outline" size="sm" className="w-full">
                        View all {items.length} {type}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </TabsContent>
          
          {Object.entries(results).map(([type, items]) => (
            <TabsContent key={type} value={type} className="space-y-2">
              {items.map((item, index) => (
                <ResultCard 
                  key={index} 
                  item={item} 
                  type={type}
                />
              ))}
              {items.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No {type} found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or check your filters
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : query && !loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try different keywords or check your spelling
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default Search;
