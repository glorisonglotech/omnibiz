import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Navigation,
  Building,
  Phone,
  Mail,
  Clock,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import InteractiveMap from "@/components/InteractiveMap";
import { toast } from "sonner";

const Locations = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [locations, setLocations] = useState([]);
  const [locationStats, setLocationStats] = useState({
    totalLocations: 0,
    activeLocations: 0,
    totalEmployees: 0,
    totalInventory: 0,
    totalRevenue: 0,
    averagePerformance: 0,
  });
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  const [isViewLocationOpen, setIsViewLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    manager: "",
    operatingHours: "",
    description: "",
  });

  // Real-time data fetching function
  const fetchLocationsData = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      // Fetch locations from API
      const [locationsResponse, statsResponse] = await Promise.all([
        api.get('/locations'),
        api.get('/locations/stats')
      ]);

      const dbLocations = locationsResponse.data;
      const dbStats = statsResponse.data;

      // If no locations in database, use sample data
      if (dbLocations.length === 0) {
        // Enhanced mock locations data with real-time metrics
      const mockLocations = [
        {
          id: 1,
          name: "Main Store",
          address: "123 Business Street",
          city: "Nairobi",
          state: "Nairobi County",
          zipCode: "00100",
          phone: "+254 700 123 456",
          email: "main@omnibiz.com",
          manager: "John Doe",
          operatingHours: "8:00 AM - 8:00 PM",
          status: "active",
          employees: 12,
          inventory: 450,
          description: "Main flagship store location",
          dailyRevenue: 15420,
          monthlyRevenue: 425000,
          performance: 94,
          todayOrders: 23,
          activeCustomers: 156,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Westlands Branch",
          address: "456 Westlands Avenue",
          city: "Nairobi",
          state: "Nairobi County",
          zipCode: "00600",
          phone: "+254 700 789 012",
          email: "westlands@omnibiz.com",
          manager: "Jane Smith",
          operatingHours: "9:00 AM - 7:00 PM",
          status: "active",
          employees: 8,
          inventory: 320,
          description: "Westlands shopping district branch",
          dailyRevenue: 12300,
          monthlyRevenue: 340000,
          performance: 87,
          todayOrders: 18,
          activeCustomers: 124,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Mombasa Outlet",
          address: "789 Moi Avenue",
          city: "Mombasa",
          state: "Mombasa County",
          zipCode: "80100",
          phone: "+254 700 345 678",
          email: "mombasa@omnibiz.com",
          manager: "Peter Wilson",
          operatingHours: "8:30 AM - 6:30 PM",
          status: "maintenance",
          employees: 6,
          inventory: 180,
          description: "Coastal region outlet",
          dailyRevenue: 0,
          monthlyRevenue: 180000,
          performance: 45,
          todayOrders: 0,
          activeCustomers: 0,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 4,
          name: "Kisumu Branch",
          address: "321 Oginga Odinga Street",
          city: "Kisumu",
          state: "Kisumu County",
          zipCode: "40100",
          phone: "+254 700 456 789",
          email: "kisumu@omnibiz.com",
          manager: "Mary Johnson",
          operatingHours: "8:00 AM - 7:00 PM",
          status: "active",
          employees: 10,
          inventory: 280,
          description: "Western region branch",
          dailyRevenue: 9800,
          monthlyRevenue: 290000,
          performance: 82,
          todayOrders: 15,
          activeCustomers: 98,
          lastUpdated: new Date().toISOString(),
        },
      ];

        setLocations(mockLocations);

        // Calculate overall statistics
        const stats = {
          totalLocations: mockLocations.length,
          activeLocations: mockLocations.filter(loc => loc.status === 'active').length,
          totalEmployees: mockLocations.reduce((sum, loc) => sum + loc.employees, 0),
          totalInventory: mockLocations.reduce((sum, loc) => sum + loc.inventory, 0),
          totalRevenue: mockLocations.reduce((sum, loc) => sum + loc.dailyRevenue, 0),
          averagePerformance: Math.round(
            mockLocations.reduce((sum, loc) => sum + loc.performance, 0) / mockLocations.length
          ),
        };

        setLocationStats(stats);
        toast.info('No locations found. Showing sample data.');
      } else {
        // Transform database locations to match frontend format
        const transformedLocations = dbLocations.map(location => ({
          id: location._id,
          name: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          zipCode: location.zipCode,
          phone: location.phone,
          email: location.email,
          manager: location.manager,
          operatingHours: location.operatingHours,
          status: location.status,
          employees: location.employees,
          inventory: location.inventory,
          description: location.description,
          dailyRevenue: location.dailyRevenue,
          monthlyRevenue: location.dailyRevenue * 30, // Estimate
          performance: location.performance,
          todayOrders: location.dailyOrders,
          activeCustomers: location.dailyCustomers,
          lastUpdated: location.updatedAt,
        }));

        setLocations(transformedLocations);
        setLocationStats(dbStats);
      }
    } catch (error) {
      toast.error("Error fetching locations data.");
      console.error("Error fetching locations:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLocationsData();
  }, [isAuthenticated]);

  // Real-time data refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchLocationsData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLocationsData();
    setRefreshing(false);
    toast.success("Location data refreshed!");
  };

  const handleAddLocation = async () => {
    const { name, address, city, phone, manager } = newLocation;
    if (!name || !address || !city || !phone || !manager) {
      return toast.error("Please fill in all required fields.");
    }

    try {
      const response = await api.post('/locations', newLocation);

      // Refresh locations data
      await fetchLocationsData();

      toast.success("Location added successfully!");
      setIsAddLocationOpen(false);
      setNewLocation({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        email: "",
        manager: "",
        operatingHours: "",
        description: "",
      });
    } catch (error) {
      toast.error("Error adding location. Please try again.");
      console.error("Error adding location:", error);
    }
  };

  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setNewLocation(location);
    setIsEditLocationOpen(true);
  };

  const handleUpdateLocation = async () => {
    try {
      const updatedLocations = locations.map((loc) =>
        loc.id === selectedLocation.id ? { ...newLocation } : loc
      );
      setLocations(updatedLocations);
      toast.success("Location updated successfully!");
      setIsEditLocationOpen(false);
      setSelectedLocation(null);
      setNewLocation({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        email: "",
        manager: "",
        operatingHours: "",
        description: "",
      });
    } catch (error) {
      toast.error("Error updating location.");
      console.error("Error updating location:", error);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      const updatedLocations = locations.filter((loc) => loc.id !== locationId);
      setLocations(updatedLocations);
      toast.success("Location deleted successfully!");
    } catch (error) {
      toast.error("Error deleting location.");
      console.error("Error deleting location:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to manage locations.</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Locations Overview</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and management of your business locations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Navigate to analytics page or show analytics modal
              window.location.href = '/dashboard/analytics';
              toast.success('Redirecting to analytics dashboard...');
            }}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Open map view in new tab or modal
              window.open('https://maps.google.com', '_blank');
              toast.success('Opening map view...');
            }}
          >
            <Navigation className="mr-2 h-4 w-4" />
            View Map
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationStats.totalLocations}</div>
            <p className="text-xs text-muted-foreground">
              {locationStats.activeLocations} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{locationStats.activeLocations}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((locationStats.activeLocations / locationStats.totalLocations) * 100)}% operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationStats.totalInventory.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Items in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {locationStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationStats.averagePerformance}%</div>
            <p className="text-xs text-muted-foreground">
              Overall efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Location Dialog */}
      <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-500 cursor-pointer hover:bg-green-400">
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                  Add a new business location or branch
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location-name">Location Name *</Label>
                  <Input
                    id="location-name"
                    placeholder="Enter location name"
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="manager">Manager *</Label>
                  <Input
                    id="manager"
                    placeholder="Manager name"
                    value={newLocation.manager}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, manager: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Street address"
                    value={newLocation.address}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={newLocation.city}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/County</Label>
                  <Input
                    id="state"
                    placeholder="State or County"
                    value={newLocation.state}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, state: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip/Postal Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="Postal code"
                    value={newLocation.zipCode}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, zipCode: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    placeholder="+254 700 000 000"
                    value={newLocation.phone}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="location@omnibiz.com"
                    value={newLocation.email}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <Input
                    id="operatingHours"
                    placeholder="8:00 AM - 6:00 PM"
                    value={newLocation.operatingHours}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        operatingHours: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Location description"
                    value={newLocation.description}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddLocationOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddLocation}>Add Location</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Locations</span>
            <Badge variant="outline" className="text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </CardTitle>
          <CardDescription>Real-time monitoring and management of your business locations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Today's Metrics</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {location.name}
                        {location.status === 'active' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {location.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {location.city}, {location.state}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{location.performance}%</div>
                        {location.performance >= 90 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : location.performance >= 70 ? (
                          <Activity className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            location.performance >= 90 ? 'bg-green-500' :
                            location.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${location.performance}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="font-medium">KES {location.dailyRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-3 w-3" />
                        <span>{location.todayOrders} orders</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{location.activeCustomers} customers</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{location.manager}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.employees} staff members
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {location.phone}
                      </div>
                      {location.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {location.email}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {location.operatingHours}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={getStatusColor(location.status)}>
                        {location.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {location.status === 'maintenance' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {location.status === 'closed' && <XCircle className="h-3 w-3 mr-1" />}
                        {location.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {location.inventory} items
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLocation(location);
                          setIsViewLocationOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLocation(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Location Details Dialog */}
      <Dialog open={isViewLocationOpen} onOpenChange={setIsViewLocationOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {selectedLocation?.name} - Detailed View
            </DialogTitle>
            <DialogDescription>
              Real-time location performance and operational details
            </DialogDescription>
          </DialogHeader>

          {selectedLocation && (
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Performance Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedLocation.performance}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          selectedLocation.performance >= 90 ? 'bg-green-500' :
                          selectedLocation.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedLocation.performance}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Today's Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KES {selectedLocation.dailyRevenue.toLocaleString()}</div>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +15% vs yesterday
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Orders Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedLocation.todayOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedLocation.activeCustomers} active customers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Inventory Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedLocation.inventory}</div>
                    <p className="text-xs text-muted-foreground">Items in stock</p>
                  </CardContent>
                </Card>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Location Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{selectedLocation.address}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zipCode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLocation.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLocation.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLocation.operatingHours}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Staff & Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Manager: {selectedLocation.manager}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLocation.employees} Staff Members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Status: </span>
                      <Badge className={getStatusColor(selectedLocation.status)}>
                        {selectedLocation.status}
                      </Badge>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">{selectedLocation.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewLocationOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewLocationOpen(false);
              handleEditLocation(selectedLocation);
            }}>
              Edit Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditLocationOpen} onOpenChange={setIsEditLocationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>Update location information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-location-name">Location Name *</Label>
              <Input
                id="edit-location-name"
                placeholder="Enter location name"
                value={newLocation.name}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-manager">Manager *</Label>
              <Input
                id="edit-manager"
                placeholder="Manager name"
                value={newLocation.manager}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, manager: e.target.value })
                }
              />
            </div>
            {/* Add other fields similar to the add dialog */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditLocationOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateLocation}>Update Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Locations;
