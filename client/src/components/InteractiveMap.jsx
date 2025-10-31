import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different location types
const createCustomIcon = (type, isSelected) => {
  const colors = {
    branch: isSelected ? '#2563eb' : '#ef4444',
    warehouse: isSelected ? '#2563eb' : '#f59e0b',
    office: isSelected ? '#2563eb' : '#8b5cf6',
    store: isSelected ? '#2563eb' : '#10b981',
    headquarters: isSelected ? '#2563eb' : '#ec4899',
  };

  const color = colors[type] || colors.branch;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Component to handle map center changes
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom, map]);

  return null;
};

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
                className="w-full rounded-lg overflow-hidden border-2 border-gray-200"
                style={{ height: `${height}px` }}
              >
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={zoom}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController center={mapCenter} zoom={zoom} />

                  {filteredLocations.map((location) => (
                    <Marker
                      key={location.id}
                      position={[location.coordinates.lat, location.coordinates.lng]}
                      icon={createCustomIcon(location.type, selectedLocation?.id === location.id)}
                      eventHandlers={{
                        click: () => handleLocationSelect(location),
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">{location.address}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                                {location.status}
                              </Badge>
                              <Badge variant="outline">{location.type}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t">
                              <div>
                                <p className="text-xs text-gray-500">Employees</p>
                                <p className="font-semibold">{location.employees}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Performance</p>
                                <p className="font-semibold">{location.performance}%</p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => openInGoogleMaps(location)}
                              >
                                <Navigation className="h-3 w-3 mr-1" />
                                Directions
                              </Button>
                              {onLocationEdit && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onLocationEdit(location)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
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
