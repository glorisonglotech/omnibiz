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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

const Locations = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [locations, setLocations] = useState([]);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
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

  useEffect(() => {
    const fetchLocations = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view locations.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        
        // Simulate locations data (replace with actual API call)
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
          },
        ];

        setLocations(mockLocations);
      } catch (error) {
        toast.error("Error fetching locations.");
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, [isAuthenticated]);

  const handleAddLocation = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in first.");

    const { name, address, city, phone, manager } = newLocation;
    if (!name || !address || !city || !phone || !manager) {
      return toast.error("Please fill in all required fields.");
    }

    try {
      // Simulate API call (replace with actual API endpoint)
      const newLocationData = {
        id: locations.length + 1,
        ...newLocation,
        status: "active",
        employees: 0,
        inventory: 0,
      };

      setLocations([...locations, newLocationData]);
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
      toast.error("Error adding location.");
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
          <h1 className="text-3xl font-bold text-foreground">Locations</h1>
          <p className="text-muted-foreground">
            Manage your business locations and branches
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Navigation className="mr-2 h-4 w-4" />
            View Map
          </Button>
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
        </div>
      </div>

      {/* Locations Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">Active business locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.reduce((sum, loc) => sum + loc.employees, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.reduce((sum, loc) => sum + loc.inventory, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Items in stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
          <CardDescription>Manage your business locations and branches</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{location.address}</div>
                      <div className="text-muted-foreground">
                        {location.city}, {location.state} {location.zipCode}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{location.manager}</TableCell>
                  <TableCell>
                    <div className="text-sm">
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
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(location.status)}>
                      {location.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{location.employees}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
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
