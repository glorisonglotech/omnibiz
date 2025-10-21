import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Plus, Edit, Trash2, Upload, Download, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

// Sample services to populate database
const sampleServices = [
  {
    name: 'Professional Haircut & Styling',
    description: 'Expert haircut and styling service tailored to your preferences. Includes wash, cut, and blow-dry.',
    price: 1500,
    duration: '45 min',
    category: 'Hair & Beauty',
  },
  {
    name: 'Full Body Massage',
    description: 'Relaxing full body massage to relieve stress and tension. Perfect for unwinding after a long day.',
    price: 3500,
    duration: '90 min',
    category: 'Wellness & Spa',
  },
  {
    name: 'Manicure & Pedicure',
    description: 'Complete nail care service including filing, buffing, cuticle care, and polish application.',
    price: 2000,
    duration: '60 min',
    category: 'Hair & Beauty',
  },
  {
    name: 'Personal Training Session',
    description: 'One-on-one fitness training with certified personal trainer. Customized workout plan included.',
    price: 2500,
    duration: '60 min',
    category: 'Fitness & Health',
  },
  {
    name: 'Deep Tissue Massage',
    description: 'Therapeutic massage targeting deep muscle layers to relieve chronic pain and muscle tension.',
    price: 4000,
    duration: '75 min',
    category: 'Wellness & Spa',
  },
  {
    name: 'Facial Treatment',
    description: 'Rejuvenating facial treatment with deep cleansing, exfoliation, and hydration for glowing skin.',
    price: 3000,
    duration: '60 min',
    category: 'Hair & Beauty',
  },
  {
    name: 'Yoga Class',
    description: 'Group or private yoga session for flexibility, strength, and mindfulness. All levels welcome.',
    price: 1200,
    duration: '60 min',
    category: 'Fitness & Health',
  },
  {
    name: 'Hair Coloring Service',
    description: 'Professional hair coloring with premium products. Includes consultation, application, and styling.',
    price: 4500,
    duration: '120 min',
    category: 'Hair & Beauty',
  },
  {
    name: 'Nutritional Consultation',
    description: 'Personalized nutrition plan and dietary guidance from certified nutritionist.',
    price: 2800,
    duration: '45 min',
    category: 'Fitness & Health',
  },
  {
    name: 'Hot Stone Massage',
    description: 'Luxurious massage using heated stones to melt away tension and promote deep relaxation.',
    price: 4500,
    duration: '90 min',
    category: 'Wellness & Spa',
  },
  {
    name: 'Makeup Application',
    description: 'Professional makeup for events, photoshoots, or special occasions. Includes consultation.',
    price: 3500,
    duration: '60 min',
    category: 'Hair & Beauty',
  },
  {
    name: 'Aromatherapy Session',
    description: 'Therapeutic treatment using essential oils to enhance physical and emotional well-being.',
    price: 3200,
    duration: '60 min',
    category: 'Wellness & Spa',
  },
  {
    name: 'Group Fitness Class',
    description: 'High-energy group workout including cardio, strength training, and flexibility exercises.',
    price: 800,
    duration: '45 min',
    category: 'Fitness & Health',
  },
  {
    name: 'Reflexology Treatment',
    description: 'Foot reflexology targeting pressure points to promote healing and relaxation throughout the body.',
    price: 2500,
    duration: '60 min',
    category: 'Wellness & Spa',
  },
  {
    name: 'Bridal Hair & Makeup',
    description: 'Complete bridal beauty package including hair styling, makeup, and trial session.',
    price: 8500,
    duration: '150 min',
    category: 'Hair & Beauty',
  }
];

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Ensure we always set an array
      const serviceData = response.data;
      const servicesList = Array.isArray(serviceData) ? serviceData : (serviceData?.services || []);
      
      setServices(servicesList);
      console.log(`✅ Loaded ${servicesList.length} services`);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
      setServices([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post("/services", newService, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Service added successfully!");
      setIsAddServiceOpen(false);
      setNewService({ name: "", description: "", price: "", duration: "", category: "" });
      fetchServices();
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Failed to add service");
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Service deleted successfully!");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  };

  const loadSampleServices = async () => {
    setLoadingSample(true);
    try {
      const token = localStorage.getItem("token");
      let successCount = 0;
      let errorCount = 0;

      for (const service of sampleServices) {
        try {
          await api.post("/services", service, {
            headers: { Authorization: `Bearer ${token}` },
          });
          successCount++;
        } catch (error) {
          console.error(`Error adding service ${service.name}:`, error);
          console.error('Error details:', error.response?.data);
          errorCount++;
          
          // Show specific error for first failure
          if (errorCount === 1) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error('First error message:', errorMsg);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} of ${sampleServices.length} sample services!`);
        fetchServices();
      }
      if (errorCount > 0) {
        const errorMsg = errorCount === sampleServices.length 
          ? 'All services failed to add. Please check your permissions.'
          : `${errorCount} services failed to add`;
        toast.warning(errorMsg);
      }
      if (successCount === 0 && errorCount === 0) {
        toast.info('No services were added');
      }
    } catch (error) {
      console.error("Error loading sample services:", error);
      const errorMsg = error.response?.status === 403 
        ? "Permission denied. Please ensure you're logged in with proper access."
        : error.response?.data?.message || "Failed to load sample services";
      toast.error(errorMsg);
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground">Manage your service offerings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchServices} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={loadSampleServices} variant="secondary" disabled={loadingSample}>
            <Upload className={`h-4 w-4 mr-2 ${loadingSample ? 'animate-spin' : ''}`} />
            {loadingSample ? 'Loading...' : 'Load Sample Services'}
          </Button>
          <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>Create a new service offering</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Service Name *</Label>
                  <Input
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="e.g., Haircut & Styling"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Describe your service"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (KES) *</Label>
                    <Input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder="1500"
                    />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      placeholder="60 min"
                    />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newService.category} onValueChange={(value) => setNewService({ ...newService, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hair & Beauty">Hair & Beauty</SelectItem>
                      <SelectItem value="Wellness & Spa">Wellness & Spa</SelectItem>
                      <SelectItem value="Fitness & Health">Fitness & Health</SelectItem>
                      <SelectItem value="Professional Services">Professional Services</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddServiceOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddService}>Add Service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>Manage and track all your service offerings</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
              <p className="text-muted-foreground mb-4">Add your first service or load sample services</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={loadSampleServices} disabled={loadingSample}>
                  <Upload className="h-4 w-4 mr-2" />
                  Load 15 Sample Services
                </Button>
                <Button onClick={() => setIsAddServiceOpen(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manually
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service._id || service.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.description?.substring(0, 50)}...</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.category || 'Uncategorized'}</Badge>
                    </TableCell>
                    <TableCell>{service.duration || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">KES {service.price?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service._id || service.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;
