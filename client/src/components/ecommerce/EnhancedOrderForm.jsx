import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Plus,
  Trash2,
  ShoppingCart,
  Check,
  AlertCircle,
  Bell,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

const EnhancedOrderForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  products = [],
  mode = 'add' // 'add' or 'edit'
}) => {
  const [formData, setFormData] = useState(initialData || {
    supplier: {
      name: "",
      email: "",
      phone: "",
      address: ""
    },
    items: [],
    total: 0,
    status: "Pending",
    paymentStatus: "Unpaid",
    paymentMethod: "",
    shippingMethod: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    notificationMethod: "email"
  });

  const [manualProduct, setManualProduct] = useState({
    name: "",
    sku: "",
    price: 0,
    quantity: 1
  });

  // Calculate total
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    setFormData(prev => ({ ...prev, total }));
  }, [formData.items]);

  const handleChange = (field, value) => {
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

  const addItem = () => {
    if (!manualProduct.name || !manualProduct.sku) {
      toast.error("Product name and SKU are required");
      return;
    }

    if (manualProduct.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (manualProduct.quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    // Add the manually entered product
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: `manual-${Date.now()}`,
        name: manualProduct.name,
        sku: manualProduct.sku,
        price: Number(manualProduct.price),
        quantity: Number(manualProduct.quantity),
        image: null
      }]
    }));

    // Reset manual product form
    setManualProduct({
      name: "",
      sku: "",
      price: 0,
      quantity: 1
    });
    
    toast.success(`Added ${manualProduct.name} to order`);
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    toast.info("Item removed from order");
  };

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.supplier.name || !formData.supplier.email) {
      toast.error("Supplier name and email are required");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one item to the order");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.supplier.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    await onSubmit(formData);
  };

  const statusOptions = [
    { value: "Pending", color: "bg-yellow-500" },
    { value: "Processing", color: "bg-blue-500" },
    { value: "Shipped", color: "bg-purple-500" },
    { value: "Delivered", color: "bg-green-500" },
    { value: "Cancelled", color: "bg-red-500" }
  ];

  const paymentStatusOptions = [
    { value: "Unpaid", color: "bg-red-500" },
    { value: "Partial", color: "bg-yellow-500" },
    { value: "Paid", color: "bg-green-500" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {mode === 'add' ? 'Create Supplier Order' : 'Edit Supplier Order'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Place an order to your supplier - enter supplier details and products' 
              : 'Update supplier order information and status'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            {/* Supplier Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5 text-primary" />
                Supplier Information
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Supplier Name *
                  </Label>
                  <Input
                    id="supplier-name"
                    placeholder="ABC Supplies Ltd"
                    value={formData.supplier.name}
                    onChange={(e) => handleChange('supplier.name', e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="supplier-email"
                    type="email"
                    placeholder="supplier@example.com"
                    value={formData.supplier.email}
                    onChange={(e) => handleChange('supplier.email', e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    id="supplier-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.supplier.phone}
                    onChange={(e) => handleChange('supplier.phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier-address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    id="supplier-address"
                    placeholder="123 Main St, City, State"
                    value={formData.supplier.address}
                    onChange={(e) => handleChange('supplier.address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Package className="h-5 w-5 text-primary" />
                  Order Items ({formData.items.length})
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  Total: ${formData.total.toFixed(2)}
                </Badge>
              </div>

              {/* Add Item - Manual Entry */}
              <div className="space-y-3 p-4 bg-accent/30 rounded-lg">
                <div className="text-sm font-medium">Add Product Manually</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Product Name *</Label>
                    <Input
                      placeholder="e.g., Office Chair"
                      value={manualProduct.name}
                      onChange={(e) => setManualProduct({...manualProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SKU/Code *</Label>
                    <Input
                      placeholder="e.g., SKU-001"
                      value={manualProduct.sku}
                      onChange={(e) => setManualProduct({...manualProduct, sku: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit Price *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={manualProduct.price}
                      onChange={(e) => setManualProduct({...manualProduct, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={manualProduct.quantity}
                      onChange={(e) => setManualProduct({...manualProduct, quantity: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={addItem} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product to Order
                </Button>
              </div>

              {/* Items List */}
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-accent/20 rounded-lg">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No items added yet</p>
                  <p className="text-xs mt-1">Enter product details above and click "Add Product to Order"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:shadow-md transition-shadow">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        <p className="text-sm font-bold text-primary">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm font-semibold w-20 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Order Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                Order Details
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-date">Order Date</Label>
                  <Input
                    id="order-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleChange('paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Credit/Debit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-status">Order Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${option.color}`} />
                            {option.value}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-status">Payment Status</Label>
                  <Select 
                    value={formData.paymentStatus} 
                    onValueChange={(value) => handleChange('paymentStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${option.color}`} />
                            {option.value}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-method">Shipping Method</Label>
                  <Select 
                    value={formData.shippingMethod} 
                    onValueChange={(value) => handleChange('shippingMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard Shipping</SelectItem>
                      <SelectItem value="Express">Express Shipping</SelectItem>
                      <SelectItem value="Overnight">Overnight</SelectItem>
                      <SelectItem value="Pickup">Store Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notification Method Selector */}
              <div className="space-y-2">
                <Label htmlFor="notification-method" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Supplier Notification Method
                </Label>
                <Select 
                  value={formData.notificationMethod} 
                  onValueChange={(value) => handleChange('notificationMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Email & SMS
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose how you want to notify the supplier about this order
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions, delivery notes, etc..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="resize-none h-20"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">
              Total: ${formData.total.toFixed(2)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Check className="h-4 w-4" />
              {mode === 'add' ? 'Create Order' : 'Update Order'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedOrderForm;
