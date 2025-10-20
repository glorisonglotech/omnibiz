import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, TrendingUp, Eye, Copy, DollarSign, Tag, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const { socket, connected } = useSocket();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    code: '',
    isActive: true,
    isSeasonalPromotion: false,
    seasonalDetails: {
      seasonName: '',
      bannerImage: '',
      bannerText: '',
      priority: 0
    },
    applicableTo: 'all',
    applicableProducts: [],
    applicableServices: [],
    minPurchaseAmount: 0,
    maxDiscountAmount: '',
    usageLimit: {
      total: '',
      perCustomer: 1
    },
    validFrom: '',
    validUntil: '',
    showOnStorefront: true,
    showNewArrivalsBadge: false,
    customerSegment: 'all'
  });

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
    fetchServices();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/discounts');
      setDiscounts(data.discounts || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(Array.isArray(data) ? data : (data?.services || []));
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Real-time updates
  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('discount_created', () => {
      fetchDiscounts();
      toast.success('New discount created');
    });

    socket.on('discount_sync', (data) => {
      if (data.type === 'update') {
        setDiscounts(prev => prev.map(d => 
          d._id === data.discount._id ? data.discount : d
        ));
      } else if (data.type === 'delete') {
        setDiscounts(prev => prev.filter(d => d._id !== data.discount._id));
      }
    });

    return () => {
      socket.off('discount_created');
      socket.off('discount_sync');
    };
  }, [socket, connected]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      code: '',
      isActive: true,
      isSeasonalPromotion: false,
      seasonalDetails: {
        seasonName: '',
        bannerImage: '',
        bannerText: '',
        priority: 0
      },
      applicableTo: 'all',
      applicableProducts: [],
      applicableServices: [],
      minPurchaseAmount: 0,
      maxDiscountAmount: '',
      usageLimit: {
        total: '',
        perCustomer: 1
      },
      validFrom: '',
      validUntil: '',
      showOnStorefront: true,
      showNewArrivalsBadge: false,
      customerSegment: 'all'
    });
    setEditingDiscount(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.value || !formData.validFrom || !formData.validUntil) {
        toast.error('Please fill in all required fields');
        return;
      }

      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        minPurchaseAmount: parseFloat(formData.minPurchaseAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        usageLimit: {
          total: formData.usageLimit.total ? parseInt(formData.usageLimit.total) : undefined,
          perCustomer: parseInt(formData.usageLimit.perCustomer) || 1
        }
      };

      if (editingDiscount) {
        await api.put(`/discounts/${editingDiscount._id}`, payload);
        toast.success('Discount updated successfully');
      } else {
        await api.post('/discounts', payload);
        toast.success('Discount created successfully');
      }

      fetchDiscounts();
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error(error.response?.data?.message || 'Failed to save discount');
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name || '',
      description: discount.description || '',
      type: discount.type || 'percentage',
      value: discount.value?.toString() || '',
      code: discount.code || '',
      isActive: discount.isActive ?? true,
      isSeasonalPromotion: discount.isSeasonalPromotion || false,
      seasonalDetails: discount.seasonalDetails || {
        seasonName: '',
        bannerImage: '',
        bannerText: '',
        priority: 0
      },
      applicableTo: discount.applicableTo || 'all',
      minPurchaseAmount: discount.minPurchaseAmount || 0,
      maxDiscountAmount: discount.maxDiscountAmount?.toString() || '',
      usageLimit: {
        total: discount.usageLimit?.total?.toString() || '',
        perCustomer: discount.usageLimit?.perCustomer || 1
      },
      validFrom: discount.validFrom ? new Date(discount.validFrom).toISOString().split('T')[0] : '',
      validUntil: discount.validUntil ? new Date(discount.validUntil).toISOString().split('T')[0] : '',
      showOnStorefront: discount.showOnStorefront ?? true,
      showNewArrivalsBadge: discount.showNewArrivalsBadge || false,
      customerSegment: discount.customerSegment || 'all'
    });
    setIsCreateOpen(true);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/discounts/${id}/toggle`);
      toast.success(`Discount ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchDiscounts();
    } catch (error) {
      toast.error('Failed to toggle discount status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      await api.delete(`/discounts/${id}`);
      toast.success('Discount deleted successfully');
      fetchDiscounts();
    } catch (error) {
      toast.error('Failed to delete discount');
    }
  };

  const stats = {
    total: discounts.length,
    active: discounts.filter(d => d.isActive).length,
    totalRedemptions: discounts.reduce((sum, d) => sum + (d.stats?.redemptions || 0), 0),
    totalRevenue: discounts.reduce((sum, d) => sum + (d.stats?.revenue || 0), 0)
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Discounts & Promotions</h1>
          <p className="text-muted-foreground">Manage discounts and seasonal campaigns</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Create New Discount'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Discount description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type *</Label>
                  <Select value={formData.type} onValueChange={(val) => handleInputChange('type', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (KES)</SelectItem>
                      <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Value *</Label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    placeholder={formData.type === 'percentage' ? '20' : '500'}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Discount Code (Optional)</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="SUMMER20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isSeasonalPromotion}
                  onCheckedChange={(checked) => handleInputChange('isSeasonalPromotion', checked)}
                />
                <Label>Seasonal Promotion</Label>
              </div>

              {formData.isSeasonalPromotion && (
                <div className="border p-4 rounded space-y-3">
                  <div className="grid gap-2">
                    <Label>Season Name</Label>
                    <Input
                      value={formData.seasonalDetails.seasonName}
                      onChange={(e) => handleInputChange('seasonalDetails.seasonName', e.target.value)}
                      placeholder="Black Friday Sale"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Banner Image URL</Label>
                    <Input
                      value={formData.seasonalDetails.bannerImage}
                      onChange={(e) => handleInputChange('seasonalDetails.bannerImage', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Banner Text</Label>
                    <Input
                      value={formData.seasonalDetails.bannerText}
                      onChange={(e) => handleInputChange('seasonalDetails.bannerText', e.target.value)}
                      placeholder="Up to 50% OFF on all items!"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valid From *</Label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => handleInputChange('validFrom', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Valid Until *</Label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Min Purchase Amount</Label>
                  <Input
                    type="number"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => handleInputChange('minPurchaseAmount', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Max Discount (Optional)</Label>
                  <Input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => handleInputChange('maxDiscountAmount', e.target.value)}
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.showOnStorefront}
                    onCheckedChange={(checked) => handleInputChange('showOnStorefront', checked)}
                  />
                  <Label>Show on Storefront</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingDiscount ? 'Update' : 'Create'} Discount
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All discount campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Tag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">Times used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              KES {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Discounts</CardTitle>
          <CardDescription>
            Manage your discount campaigns {connected && <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">● Live</Badge>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Tag className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No discounts yet</p>
                      <p className="text-sm text-muted-foreground">Create your first discount campaign</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                discounts.map((discount) => (
                  <TableRow key={discount._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{discount.name}</p>
                        {discount.isSeasonalPromotion && (
                          <Badge variant="secondary" className="mt-1">Seasonal</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{discount.type.replace('_', ' ')}</TableCell>
                    <TableCell className="font-semibold">
                      {discount.type === 'percentage' ? `${discount.value}%` : `KES ${discount.value}`}
                    </TableCell>
                    <TableCell>
                      {discount.code ? (
                        <Badge variant="outline">{discount.code}</Badge>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(discount.validFrom).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">
                        to {new Date(discount.validUntil).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={discount.isActive}
                        onCheckedChange={() => handleToggleActive(discount._id, discount.isActive)}
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {discount.stats?.views || 0} views
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {discount.stats?.redemptions || 0} used
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(discount)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(discount._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
