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
  FileText, 
  Users, 
  ShoppingCart, 
  DollarSign,
  MapPin,
  Calendar,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

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
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults = generateMockResults(searchQuery);
      setResults(mockResults);
      
      const total = Object.values(mockResults).reduce((sum, items) => sum + items.length, 0);
      setTotalResults(total);
      
      toast.success(`Found ${total} results for "${searchQuery}"`);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockResults = (query) => {
    const lowerQuery = query.toLowerCase();
    
    return {
      products: [
        { id: 1, name: 'Premium Widget', price: 29.99, category: 'Electronics', stock: 45 },
        { id: 2, name: 'Smart Device', price: 199.99, category: 'Technology', stock: 12 },
        { id: 3, name: 'Quality Tool', price: 89.99, category: 'Tools', stock: 23 }
      ].filter(item => item.name.toLowerCase().includes(lowerQuery)),
      
      orders: [
        { id: 'ORD-001', customer: 'John Doe', total: 299.99, status: 'Completed', date: '2024-01-15' },
        { id: 'ORD-002', customer: 'Jane Smith', total: 149.99, status: 'Processing', date: '2024-01-14' },
        { id: 'ORD-003', customer: 'Bob Johnson', total: 89.99, status: 'Shipped', date: '2024-01-13' }
      ].filter(item => 
        item.id.toLowerCase().includes(lowerQuery) || 
        item.customer.toLowerCase().includes(lowerQuery)
      ),
      
      customers: [
        { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5, totalSpent: 1299.99 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 3, totalSpent: 899.99 },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', orders: 7, totalSpent: 2199.99 }
      ].filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.email.toLowerCase().includes(lowerQuery)
      ),
      
      transactions: [
        { id: 'TXN-001', type: 'Payment', amount: 299.99, date: '2024-01-15', status: 'Completed' },
        { id: 'TXN-002', type: 'Refund', amount: -49.99, date: '2024-01-14', status: 'Processed' },
        { id: 'TXN-003', type: 'Payment', amount: 149.99, date: '2024-01-13', status: 'Pending' }
      ].filter(item => 
        item.id.toLowerCase().includes(lowerQuery) || 
        item.type.toLowerCase().includes(lowerQuery)
      ),
      
      locations: [
        { id: 1, name: 'Main Store', address: '123 Main St', type: 'Store', status: 'Active' },
        { id: 2, name: 'Warehouse A', address: '456 Industrial Blvd', type: 'Warehouse', status: 'Active' },
        { id: 3, name: 'Pop-up Shop', address: '789 Mall Ave', type: 'Popup', status: 'Temporary' }
      ].filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.address.toLowerCase().includes(lowerQuery)
      ),
      
      appointments: [
        { id: 1, client: 'Alice Brown', service: 'Consultation', date: '2024-01-20', time: '10:00 AM' },
        { id: 2, client: 'Charlie Davis', service: 'Installation', date: '2024-01-21', time: '2:00 PM' },
        { id: 3, client: 'Diana Wilson', service: 'Maintenance', date: '2024-01-22', time: '9:00 AM' }
      ].filter(item => 
        item.client.toLowerCase().includes(lowerQuery) || 
        item.service.toLowerCase().includes(lowerQuery)
      ),
      
      documents: [
        { id: 1, name: 'Invoice Template', type: 'PDF', size: '245 KB', modified: '2024-01-15' },
        { id: 2, name: 'Product Catalog', type: 'PDF', size: '1.2 MB', modified: '2024-01-14' },
        { id: 3, name: 'User Manual', type: 'PDF', size: '890 KB', modified: '2024-01-13' }
      ].filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.type.toLowerCase().includes(lowerQuery)
      )
    };
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(query)}`);
    }
  };

  const ResultCard = ({ item, type, onClick }) => {
    const getIcon = () => {
      switch (type) {
        case 'products': return <Package className="h-4 w-4" />;
        case 'orders': return <ShoppingCart className="h-4 w-4" />;
        case 'customers': return <Users className="h-4 w-4" />;
        case 'transactions': return <DollarSign className="h-4 w-4" />;
        case 'locations': return <MapPin className="h-4 w-4" />;
        case 'appointments': return <Calendar className="h-4 w-4" />;
        case 'documents': return <FileText className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
      }
    };

    return (
      <div 
        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className="text-muted-foreground mt-1">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {item.name || item.client || item.customer || item.id}
            </div>
            <div className="text-sm text-muted-foreground">
              {type === 'products' && `$${item.price} • ${item.stock} in stock`}
              {type === 'orders' && `${item.status} • $${item.total}`}
              {type === 'customers' && `${item.orders} orders • $${item.totalSpent}`}
              {type === 'transactions' && `${item.type} • $${Math.abs(item.amount)}`}
              {type === 'locations' && `${item.type} • ${item.status}`}
              {type === 'appointments' && `${item.service} • ${item.date}`}
              {type === 'documents' && `${item.type} • ${item.size}`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SearchIcon className="h-8 w-8 text-green-600" />
            Search
          </h1>
          <p className="text-muted-foreground">
            Find anything across your business data
          </p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
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

      {/* Search Results */}
      {totalResults > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              {Object.entries(results).map(([type, items]) => 
                items.length > 0 && (
                  <TabsTrigger key={type} value={type} className="capitalize">
                    {type} ({items.length})
                  </TabsTrigger>
                )
              )}
            </TabsList>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

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
                        onClick={() => toast.info(`Opening ${type} details...`)}
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

          {Object.entries(results).map(([type, items]) => 
            items.length > 0 && (
              <TabsContent key={type} value={type}>
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize">{type}</CardTitle>
                    <CardDescription>
                      {items.length} result{items.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.map((item, index) => (
                      <ResultCard 
                        key={index} 
                        item={item} 
                        type={type}
                        onClick={() => toast.info(`Opening ${type} details...`)}
                      />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            )
          )}
        </Tabs>
      ) : query && !loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse by category
            </p>
          </CardContent>
        </Card>
      ) : !query ? (
        <Card>
          <CardContent className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a search term to find products, orders, customers, and more
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default Search;
