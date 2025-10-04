import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Navigation, Search, Filter, Layers, 
  Maximize2, Minimize2, RefreshCw, Plus, Minus,
  Home, Building, Store, Users, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

const InteractiveMap = ({ 
  title = "Business Locations",
  height = 400,
  showControls = true,
  locations = [],
  onLocationSelect = null,
  fullscreen = false,
  onFullscreenToggle = null
}) => {
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [zoom, setZoom] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const mapRef = useRef(null);

  // Mock locations data if none provided
  const defaultLocations = [
    {
      id: 1,
      name: "Main Office",
      address: "123 Business St, City Center",
      lat: -1.2921,
      lng: 36.8219,
      type: "office",
      revenue: 125000,
      customers: 450,
      status: "active"
    },
    {
      id: 2,
      name: "Retail Store A",
      address: "456 Shopping Ave, Mall District",
      lat: -1.2841,
      lng: 36.8155,
      type: "retail",
      revenue: 89000,
      customers: 320,
      status: "active"
    },
    {
      id: 3,
      name: "Warehouse",
      address: "789 Industrial Rd, Warehouse Zone",
      lat: -1.3021,
      lng: 36.8319,
      type: "warehouse",
      revenue: 45000,
      customers: 120,
      status: "active"
    },
    {
      id: 4,
      name: "Branch Office",
      address: "321 Corporate Blvd, Business Park",
      lat: -1.2721,
      lng: 36.8419,
      type: "office",
      revenue: 67000,
      customers: 200,
      status: "maintenance"
    }
  ];

  const mapLocations = locations.length > 0 ? locations : defaultLocations;

  useEffect(() => {
    // Filter locations based on search query
    const filtered = mapLocations.filter(location =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchQuery, mapLocations]);

  const toggleFullscreen = () => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    if (onFullscreenToggle) {
      onFullscreenToggle(newFullscreen);
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    toast.success(`Selected: ${location.name}`);
  };

  const getLocationIcon = (type) => {
    switch (type) {
      case 'office':
        return <Building className="h-4 w-4" />;
      case 'retail':
        return <Store className="h-4 w-4" />;
      case 'warehouse':
        return <Home className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const MapView = () => (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="text-gray-400">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Location Markers */}
      {filteredLocations.map((location, index) => (
        <div
          key={location.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{
            left: `${20 + (index * 15) % 60}%`,
            top: `${30 + (index * 12) % 40}%`
          }}
          onClick={() => handleLocationClick(location)}
        >
          <div className="relative">
            <div className={`w-6 h-6 rounded-full ${getStatusColor(location.status)} flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform`}>
              {getLocationIcon(location.type)}
            </div>
            {selectedLocation?.id === location.id && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg border min-w-48 z-10">
                <h4 className="font-semibold text-sm">{location.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{location.address}</p>
                <div className="flex justify-between text-xs">
                  <span>Revenue: ${location.revenue?.toLocaleString()}</span>
                  <span>Customers: {location.customers}</span>
                </div>
                <Badge variant="outline" className="mt-1 text-xs">
                  {location.status}
                </Badge>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white"
          onClick={() => setZoom(Math.min(zoom + 1, 20))}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white"
          onClick={() => setZoom(Math.max(zoom - 1, 1))}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h5 className="font-semibold text-sm mb-2">Legend</h5>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 m-4' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>
            Interactive map showing business locations and analytics
          </CardDescription>
        </div>
        
        {showControls && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-40"
              />
            </div>

            <Select value={mapType} onValueChange={setMapType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roadmap">Road</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Layers className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
          <MapView />
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">
            <MapPin className="h-3 w-3 mr-1" />
            {filteredLocations.length} locations
          </Badge>
          <Badge variant="secondary">
            <TrendingUp className="h-3 w-3 mr-1" />
            Total Revenue: ${filteredLocations.reduce((sum, loc) => sum + (loc.revenue || 0), 0).toLocaleString()}
          </Badge>
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            Total Customers: {filteredLocations.reduce((sum, loc) => sum + (loc.customers || 0), 0)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
