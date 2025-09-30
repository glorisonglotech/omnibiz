import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const LocationPicker = ({ 
  value = null, 
  onChange = null, 
  placeholder = "Select location",
  className = "",
  showCurrentLocation = true,
  showSearch = true,
  countries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda'],
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(value);

  // Popular cities in East Africa
  const popularLocations = [
    { name: 'Nairobi', country: 'Kenya', coordinates: [-1.2921, 36.8219] },
    { name: 'Mombasa', country: 'Kenya', coordinates: [-4.0435, 39.6682] },
    { name: 'Kisumu', country: 'Kenya', coordinates: [-0.1022, 34.7617] },
    { name: 'Nakuru', country: 'Kenya', coordinates: [-0.3031, 36.0800] },
    { name: 'Eldoret', country: 'Kenya', coordinates: [0.5143, 35.2698] },
    { name: 'Kampala', country: 'Uganda', coordinates: [0.3476, 32.5825] },
    { name: 'Dar es Salaam', country: 'Tanzania', coordinates: [-6.7924, 39.2083] },
    { name: 'Kigali', country: 'Rwanda', coordinates: [-1.9441, 30.0619] },
    { name: 'Arusha', country: 'Tanzania', coordinates: [-3.3869, 36.6830] },
    { name: 'Entebbe', country: 'Uganda', coordinates: [0.0514, 32.4634] }
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchLocations(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              const location = {
                name: result.formatted,
                coordinates: [latitude, longitude],
                country: result.components.country,
                city: result.components.city || result.components.town || result.components.village,
                type: 'current'
              };
              setCurrentLocation(location);
              toast.success('Current location detected');
            }
          } else {
            // Fallback without reverse geocoding
            const location = {
              name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              coordinates: [latitude, longitude],
              type: 'current'
            };
            setCurrentLocation(location);
            toast.success('Current coordinates detected');
          }
        } catch (error) {
          console.error('Error getting location details:', error);
          const location = {
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            coordinates: [latitude, longitude],
            type: 'current'
          };
          setCurrentLocation(location);
          toast.success('Current coordinates detected');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out');
            break;
          default:
            toast.error('An unknown error occurred while retrieving location');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const searchLocations = async (query) => {
    try {
      // Filter popular locations first
      const filtered = popularLocations.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.country.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filtered);
      
      // You can integrate with a geocoding service here for more comprehensive search
      // For now, we'll use the popular locations
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    onChange?.(location);
    setIsOpen(false);
    toast.success(`Location set to ${location.name}`);
  };

  const formatLocationDisplay = (location) => {
    if (!location) return placeholder;
    if (location.type === 'current') return `📍 ${location.name}`;
    return `${location.name}, ${location.country}`;
  };

  const LocationCard = ({ location, onSelect }) => (
    <Card 
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={() => onSelect(location)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">{location.name}</p>
              {location.country && (
                <p className="text-sm text-gray-500">{location.country}</p>
              )}
            </div>
          </div>
          {location.type === 'current' && (
            <Badge variant="outline" className="text-blue-600">
              Current
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-start text-left font-normal"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {formatLocationDisplay(selectedLocation)}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search cities, countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Current Location */}
            {showCurrentLocation && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Current Location</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    {isLoading ? 'Detecting...' : 'Detect'}
                  </Button>
                </div>
                
                {currentLocation && (
                  <LocationCard 
                    location={currentLocation} 
                    onSelect={handleLocationSelect}
                  />
                )}
              </div>
            )}

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Search Results</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((location, index) => (
                    <LocationCard
                      key={index}
                      location={location}
                      onSelect={handleLocationSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Locations */}
            {!searchQuery && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Popular Locations</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {popularLocations
                    .filter(location => countries.includes(location.country))
                    .map((location, index) => (
                      <LocationCard
                        key={index}
                        location={location}
                        onSelect={handleLocationSelect}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Selected Location */}
            {selectedLocation && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Selected Location</p>
                    <p className="text-sm text-gray-500">
                      {formatLocationDisplay(selectedLocation)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLocation(null);
                      onChange?.(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationPicker;
