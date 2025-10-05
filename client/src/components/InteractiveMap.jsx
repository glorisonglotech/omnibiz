import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter, 
  Maximize2, 
  Minimize2,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Users,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const InteractiveMap = ({ 
  locations = [], 
  onLocationSelect = null,
  onLocationAdd = null,
  onLocationEdit = null,
  onLocationDelete = null,
  className = '',
  height = 400,
  showControls = true,
  showLocationList = true
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -1.2921, lng: 36.8219 }); // Nairobi default
  const [zoom, setZoom] = useState(10);
  const mapRef = useRef(null);

  // Mock location data if none provided
  const mockLocations = [
    {
      id: 1,
      name: 'Main Store - Nairobi CBD',
      address: 'Kenyatta Avenue, Nairobi',
      type: 'store',
      coordinates: { lat: -1.2864, lng: 36.8172 },
      status: 'active',
      customers: 1250,
      revenue: 45000,
      performance: 92,
      lastUpdate: '2024-01-15T10:30:00Z',
      description: 'Primary retail location in the city center'
    },
    {
      id: 2,
      name: 'Westlands Branch',
      address: 'Westlands Road, Nairobi',
      type: 'branch',
      coordinates: { lat: -1.2676, lng: 36.8108 },
      status: 'active',
      customers: 890,
      revenue: 32000,
      performance: 87,
      lastUpdate: '2024-01-15T09:15:00Z',
      description: 'Secondary location serving Westlands area'
    },
    {
      id: 3,
      name: 'Warehouse - Industrial Area',
      address: 'Industrial Area, Nairobi',
      type: 'warehouse',
      coordinates: { lat: -1.3197, lng: 36.8510 },
      status: 'active',
      customers: 0,
      revenue: 0,
      performance: 95,
      lastUpdate: '2024-01-15T08:45:00Z',
      description: 'Main storage and distribution center'
    },
    {
      id: 4,
      name: 'Karen Outlet',
      address: 'Karen Shopping Centre',
      type: 'outlet',
      coordinates: { lat: -1.3197, lng: 36.7073 },
      status: 'maintenance',
      customers: 450,
      revenue: 18000,
      performance: 78,
      lastUpdate: '2024-01-14T16:20:00Z',
      description: 'Suburban outlet currently under maintenance'
    },
    {
      id: 5,
      name: 'Eastlands Pop-up',
      address: 'Eastlands Mall, Nairobi',
      type: 'popup',
      coordinates: { lat: -1.2921, lng: 36.8919 },
      status: 'temporary',
      customers: 320,
      revenue: 12000,
      performance: 85,
      lastUpdate: '2024-01-15T11:00:00Z',
      description: 'Temporary location for market testing'
    }
  ];

  const displayLocations = locations.length > 0 ? locations : mockLocations;

  // Filter locations based on search and type
  const filteredLocations = displayLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || location.type === filterType;
    return matchesSearch && matchesType;
  });

  // Get location type color
  const getLocationTypeColor = (type) => {
    switch (type) {
      case 'store': return 'bg-blue-100 text-blue-800';
      case 'branch': return 'bg-green-100 text-green-800';
      case 'warehouse': return 'bg-purple-100 text-purple-800';
      case 'outlet': return 'bg-orange-100 text-orange-800';
      case 'popup': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'temporary': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setMapCenter(location.coordinates);
    setZoom(15);
    
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    
    toast.success(`Selected ${location.name}`);
  };

  // Open in Google Maps
  const openInGoogleMaps = (location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(url, '_blank');
    toast.success('Opening in Google Maps...');
  };

  // Get directions
  const getDirections = (location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(url, '_blank');
    toast.success('Getting directions...');
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const LocationCard = ({ location }) => (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        selectedLocation?.id === location.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={() => handleLocationSelect(location)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-sm">{location.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Badge className={`text-xs ${getLocationTypeColor(location.type)}`}>
            {location.type}
          </Badge>
          <Badge className={`text-xs ${getStatusColor(location.status)}`}>
            {location.status}
          </Badge>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">{location.address}</p>
      
      {location.description && (
        <p className="text-xs text-muted-foreground mb-3">{location.description}</p>
      )}
      
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-blue-600" />
          <span>{location.customers || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-green-600" />
          <span>${(location.revenue || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-purple-600" />
          <span>{location.performance || 0}%</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{new Date(location.lastUpdate).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              openInGoogleMaps(location);
            }}
            className="h-6 w-6 p-0"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              getDirections(location);
            }}
            className="h-6 w-6 p-0"
          >
            <Navigation className="h-3 w-3" />
          </Button>
          {onLocationEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onLocationEdit(location);
              }}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Interactive Location Map
              </CardTitle>
              <CardDescription>
                Manage and visualize your business locations
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {onLocationAdd && (
                <Button size="sm" onClick={onLocationAdd}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Location
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="store">Stores</SelectItem>
                  <SelectItem value="branch">Branches</SelectItem>
                  <SelectItem value="warehouse">Warehouses</SelectItem>
                  <SelectItem value="outlet">Outlets</SelectItem>
                  <SelectItem value="popup">Pop-ups</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className={`grid ${showLocationList ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
            {/* Map Container */}
            <div className="space-y-4">
              <div 
                ref={mapRef}
                className="w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative"
                style={{ height: `${height}px` }}
              >
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">Interactive Map</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Map integration would display here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)} | Zoom: {zoom}
                  </p>
                </div>
                
                {/* Map overlay with location markers simulation */}
                <div className="absolute inset-0 pointer-events-none">
                  {filteredLocations.map((location, index) => (
                    <div
                      key={location.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                      style={{
                        left: `${20 + (index * 15) % 60}%`,
                        top: `${30 + (index * 10) % 40}%`
                      }}
                    >
                      <div 
                        className={`w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 ${
                          selectedLocation?.id === location.id ? 'bg-blue-600' : 'bg-red-500'
                        }`}
                        onClick={() => handleLocationSelect(location)}
                        title={location.name}
                      >
                        <MapPin className="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedLocation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedLocation.name}</CardTitle>
                    <CardDescription>{selectedLocation.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedLocation.customers}</div>
                        <div className="text-xs text-muted-foreground">Customers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">${selectedLocation.revenue?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => openInGoogleMaps(selectedLocation)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => getDirections(selectedLocation)}
                        className="flex-1"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Location List */}
            {showLocationList && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Locations ({filteredLocations.length})</h3>
                  <Badge variant="secondary">{filteredLocations.length} found</Badge>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredLocations.map((location) => (
                    <LocationCard key={location.id} location={location} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveMap;
