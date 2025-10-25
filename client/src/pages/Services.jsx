import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Calendar, Clock, DollarSign, Users, Eye, Briefcase } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Services = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "60",
    category: "General",
    image: "",
    availableTeamMembers: [],
    maxBookingsPerSlot: 1,
    isActive: true
  });

  const categories = [
    "Hair & Beauty",
    "Wellness & Spa",
    "Fitness & Health",
    "Medical & Healthcare",
    "Professional Services",
    "Home Services",
    "General"
  ];

  useEffect(() => {
    fetchServices();
    fetchTeamMembers();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      const servicesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.services || []);
      
      setServices(servicesData);
      console.log('✅ Loaded', servicesData.length, 'services');
    } catch (error) {
      console.error('Error fetching services:', error);
      // Set empty array on error instead of showing error toast
      setServices([]);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/team', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: `${formData.duration} min`,
        owner: user._id,
        maxBookingsPerSlot: formData.maxBookingsPerSlot || 1,
        isActive: formData.isActive !== false
      };

      if (editingService) {
        // Update existing service
        await api.put(`/services/${editingService._id}`, serviceData, { headers });
        toast.success('Service updated successfully!');
      } else {
        // Create new service
        await api.post('/services', serviceData, { headers });
        toast.success('Service created successfully!');
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "60",
        category: "General",
        image: "",
        availableTeamMembers: []
      });
      setEditingService(null);
      setShowDialog(false);
      
      // Refresh services list
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      description: service.description || "",
      price: service.price?.toString() || "",
      duration: service.duration?.replace(' min', '') || "60",
      category: service.category || "General",
      image: service.image || "",
      availableTeamMembers: service.availableTeamMembers || [],
      maxBookingsPerSlot: service.maxBookingsPerSlot || 1,
      isActive: service.isActive !== false
    });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Service deleted successfully!');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "60",
      category: "General",
      image: "",
      availableTeamMembers: [],
      maxBookingsPerSlot: 1,
      isActive: true
    });
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage services available on your storefront
          </p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Professional Haircut"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your service..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KES) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="1500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Service Image URL (Optional)</Label>
                <div className="space-y-2">
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                      <img 
                        src={formData.image} 
                        alt="Service preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Use high-quality images for better customer engagement
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Bookings per Slot</Label>
                  <Input
                    type="number"
                    value={formData.maxBookingsPerSlot || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxBookingsPerSlot: parseInt(e.target.value) || 1 }))}
                    placeholder="1"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">How many bookings per time slot</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={formData.isActive !== false ? 'active' : 'inactive'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'active' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    resetForm();
                    setShowDialog(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingService ? 'Update Service' : 'Create Service'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(services) ? services.length : 0}</div>
            <p className="text-xs text-muted-foreground">Active services</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(services) ? new Set(services.map(s => s.category)).size : 0}
            </div>
            <p className="text-xs text-muted-foreground">Service categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {(() => {
                if (!Array.isArray(services) || services.length === 0) return '0';
                const total = services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
                const avg = total / services.length;
                return isNaN(avg) ? '0' : Math.round(avg).toLocaleString();
              })()}
            </div>
            <p className="text-xs text-muted-foreground">Average service price</p>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading services...</p>
          </CardContent>
        </Card>
      ) : !Array.isArray(services) || services.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No Services Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first service to make it available on your storefront
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(services) && services.map((service) => (
            <Card key={service._id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Briefcase className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-foreground backdrop-blur-sm">
                    {service.category}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-1">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.duration}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {service.availableTeamMembers?.length || 0} staff
                  </span>
                </div>
                
                <div className="text-2xl font-bold text-primary">
                  KES {(service.price || 0).toLocaleString()}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(service._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
