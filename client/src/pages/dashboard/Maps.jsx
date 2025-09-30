import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter,
  Users,
  Package,
  DollarSign,
  Activity,
  RefreshCw,
  Maximize,
  Layers,
  Route,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const Maps = () => {
  const [mapData, setMapData] = useState({
    locations: [
      {
        id: 1,
        name: "Main Store",
        address: "123 Business Street, Nairobi",
        coordinates: { lat: -1.2921, lng: 36.8219 },
        status: "active",
        employees: 12,
        dailyRevenue: 15420,
        customers: 156,
        type: "store"
      },
      {
        id: 2,
        name: "Westlands Branch",
        address: "456 Westlands Avenue, Nairobi",
        coordinates: { lat: -1.2676, lng: 36.8108 },
        status: "active",
        employees: 8,
        dailyRevenue: 12300,
        customers: 98,
        type: "branch"
      },
      {
        id: 3,
        name: "Kisumu Branch",
        address: "789 Kisumu Road, Kisumu",
        coordinates: { lat: -0.0917, lng: 34.7680 },
        status: "active",
        employees: 10,
        dailyRevenue: 9800,
        customers: 87,
        type: "branch"
      },
      {
        id: 4,
        name: "Delivery Hub",
        address: "321 Industrial Area, Nairobi",
        coordinates: { lat: -1.3197, lng: 36.8510 },
        status: "active",
        employees: 5,
        dailyRevenue: 0,
        customers: 0,
        type: "warehouse"
      }
    ],
    deliveries: [
      {
        id: 1,
        orderId: "ORD-001",
        customer: "John Doe",
        address: "Kilimani, Nairobi",
        coordinates: { lat: -1.2884, lng: 36.7856 },
        status: "in_transit",
        estimatedTime: "15 mins",
        driver: "Peter Kamau"
      },
      {
        id: 2,
        orderId: "ORD-002",
        customer: "Jane Smith",
        address: "Karen, Nairobi",
        coordinates: { lat: -1.3197, lng: 36.7076 },
        status: "delivered",
        estimatedTime: "Delivered",
        driver: "Mary Wanjiku"
      },
      {
        id: 3,
        orderId: "ORD-003",
        customer: "Bob Johnson",
        address: "Eastleigh, Nairobi",
        coordinates: { lat: -1.2921, lng: 36.8570 },
        status: "pending",
        estimatedTime: "30 mins",
        driver: "James Mwangi"
      }
    ],
    analytics: {
      totalLocations: 4,
      activeDeliveries: 2,
      completedToday: 15,
      averageDeliveryTime: "22 mins",
      coverage: "85%"
    }
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapView, setMapView] = useState('locations');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Map data refreshed!');
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'in_transit': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'store': return '🏪';
      case 'branch': return '🏢';
      case 'warehouse': return '🏭';
      default: return '📍';
    }
  };

  const filteredLocations = mapData.locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDeliveries = mapData.deliveries.filter(delivery =>
    delivery.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maps & Locations</h1>
          <p className="text-muted-foreground">
            Track locations, deliveries, and geographic analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Maximize className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-muted-foreground">Total Locations</p>
            <p className="text-2xl font-bold">{mapData.analytics.totalLocations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Route className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-muted-foreground">Active Deliveries</p>
            <p className="text-2xl font-bold">{mapData.analytics.activeDeliveries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-muted-foreground">Completed Today</p>
            <p className="text-2xl font-bold">{mapData.analytics.completedToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
            <p className="text-2xl font-bold">{mapData.analytics.averageDeliveryTime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-red-600" />
            <p className="text-sm text-muted-foreground">Coverage</p>
            <p className="text-2xl font-bold">{mapData.analytics.coverage}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Interactive Map
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={mapView === 'locations' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMapView('locations')}
                  >
                    Locations
                  </Button>
                  <Button
                    variant={mapView === 'deliveries' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMapView('deliveries')}
                  >
                    Deliveries
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Placeholder for actual map component */}
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50"></div>
                <div className="relative z-10 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Map View</h3>
                  <p className="text-muted-foreground mb-4">
                    {mapView === 'locations' ? 'Showing business locations' : 'Showing active deliveries'}
                  </p>
                  <Badge variant="outline">
                    Map integration ready - Connect your preferred map service
                  </Badge>
                </div>
                
                {/* Mock location pins */}
                {mapView === 'locations' && (
                  <>
                    <div className="absolute top-20 left-32 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      1
                    </div>
                    <div className="absolute top-32 right-40 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      2
                    </div>
                    <div className="absolute bottom-20 left-20 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      3
                    </div>
                  </>
                )}
                
                {mapView === 'deliveries' && (
                  <>
                    <div className="absolute top-24 right-32 w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="absolute bottom-32 left-40 w-4 h-4 bg-green-500 rounded-full"></div>
                    <div className="absolute top-40 left-24 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search locations or deliveries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="locations" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            </TabsList>

            <TabsContent value="locations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Locations</CardTitle>
                  <CardDescription>Manage your business locations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredLocations.map((location) => (
                    <div
                      key={location.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedLocation?.id === location.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getTypeIcon(location.type)}</span>
                            <h4 className="font-medium">{location.name}</h4>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(location.status)}`}></div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{location.address}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {location.employees}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              KES {location.dailyRevenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deliveries" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Deliveries</CardTitle>
                  <CardDescription>Track ongoing deliveries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{delivery.orderId}</h4>
                          <p className="text-sm text-muted-foreground">{delivery.customer}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(delivery.status)} text-white border-none`}
                        >
                          {delivery.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{delivery.address}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Driver: {delivery.driver}</span>
                        <span className="font-medium">{delivery.estimatedTime}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Add New Location
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Route className="h-4 w-4 mr-2" />
                Plan Route
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Navigation className="h-4 w-4 mr-2" />
                Track Delivery
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Filter View
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Maps;
