import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Image as ImageIcon, Tag, DollarSign, Box, 
  Truck, AlertCircle, CheckCircle, Upload, X, Plus
} from 'lucide-react';
import { toast } from 'sonner';

// Predefined categories with subcategories
const PRODUCT_CATEGORIES = {
  'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Audio', 'Cameras', 'Gaming', 'Wearables', 'Smart Home'],
  'Clothing & Fashion': ['Men', 'Women', 'Kids', 'Shoes', 'Accessories', 'Sportswear', 'Jewelry', 'Watches', 'Bags'],
  'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Garden', 'Tools', 'Lighting', 'Storage', 'Bathroom'],
  'Books & Media': ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Magazines', 'E-books', 'Audiobooks'],
  'Sports & Outdoors': ['Equipment', 'Apparel', 'Outdoor', 'Fitness', 'Team Sports', 'Camping', 'Cycling', 'Water Sports'],
  'Toys & Games': ['Action Figures', 'Educational', 'Puzzles', 'Outdoor', 'Electronic', 'Board Games', 'Dolls', 'Building Sets'],
  'Beauty & Personal Care': ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Tools', 'Bath & Body', 'Nail Care', 'Men Grooming'],
  'Food & Beverages': ['Snacks', 'Beverages', 'Bakery', 'Organic', 'Frozen', 'Fresh Produce', 'Dairy', 'Meat', 'Canned Goods'],
  'Health & Wellness': ['Vitamins', 'Supplements', 'Personal Care', 'Medical Supplies', 'Fitness Equipment', 'Yoga', 'Diet'],
  'Automotive': ['Parts', 'Accessories', 'Maintenance', 'Electronics', 'Tires', 'Oil & Fluids', 'Tools'],
  'Baby & Kids': ['Diapers', 'Baby Food', 'Toys', 'Clothing', 'Furniture', 'Safety', 'Strollers', 'Car Seats'],
  'Pet Supplies': ['Pet Food', 'Toys', 'Accessories', 'Health', 'Grooming', 'Beds', 'Leashes', 'Aquariums'],
  'Office & Stationery': ['Paper', 'Pens', 'Notebooks', 'Furniture', 'Electronics', 'Art Supplies', 'Filing'],
  'Arts & Crafts': ['Painting', 'Drawing', 'Sewing', 'Knitting', 'Scrapbooking', 'Jewelry Making', 'Woodwork'],
  'Music & Instruments': ['Guitars', 'Keyboards', 'Drums', 'Accessories', 'DJ Equipment', 'Sheet Music'],
  'Tools & Hardware': ['Hand Tools', 'Power Tools', 'Electrical', 'Plumbing', 'Safety', 'Measuring', 'Fasteners'],
  'Jewelry & Watches': ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Watches', 'Accessories'],
  'Appliances': ['Kitchen', 'Laundry', 'Cleaning', 'Heating', 'Cooling', 'Small Appliances'],
  'Furniture': ['Living Room', 'Bedroom', 'Office', 'Outdoor', 'Storage', 'Kids'],
  'Photography': ['Cameras', 'Lenses', 'Tripods', 'Lighting', 'Bags', 'Accessories', 'Drones'],
  'Party & Events': ['Decorations', 'Supplies', 'Balloons', 'Costumes', 'Tableware'],
  'Luggage & Travel': ['Suitcases', 'Backpacks', 'Travel Accessories', 'Organizers'],
  'Industrial & Scientific': ['Lab Equipment', 'Safety', 'Testing', 'Machinery', 'Raw Materials'],
  'Other': ['Custom Category']
};

// Predefined units
const UNITS = ['piece', 'kg', 'g', 'liter', 'ml', 'pack', 'box', 'dozen'];

// Predefined brands
const BRANDS = [
  'Generic', 'Samsung', 'Apple', 'Sony', 'Nike', 'Adidas', 'HP', 'Dell', 
  'Lenovo', 'Canon', 'Nikon', 'LG', 'Panasonic', 'Philips', 'Xiaomi'
];

// Product status options
const STATUS_OPTIONS = ['active', 'inactive', 'draft', 'out-of-stock'];

// Condition options
const CONDITION_OPTIONS = ['new', 'refurbished', 'used-like-new', 'used-good', 'used-acceptable'];

const EnhancedProductForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  mode = 'add' // 'add' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    barcode: '',
    stock: '',
    minStock: '',
    unit: 'piece',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    condition: 'new',
    status: 'active',
    supplier: '',
    cost: '',
    taxRate: '16', // Default VAT in Kenya
    featured: false,
    freeShipping: false,
    allowBackorder: false,
    trackInventory: true,
    images: [],
    tags: [],
    specifications: [],
    warranty: '',
    returnPolicy: '30',
    metaTitle: '',
    metaDescription: ''
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentSpec, setCurrentSpec] = useState({ key: '', value: '' });
  const [subcategories, setSubcategories] = useState([]);
  const [profit, setProfit] = useState(0);
  const [margin, setMargin] = useState(0);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.category) {
      if (formData.category === 'Other') {
        setShowCustomCategory(true);
        setSubcategories([]);
      } else {
        setShowCustomCategory(false);
        setSubcategories(PRODUCT_CATEGORIES[formData.category] || []);
      }
    }
  }, [formData.category]);

  // Calculate profit and margin
  useEffect(() => {
    const price = parseFloat(formData.price) || 0;
    const cost = parseFloat(formData.cost) || 0;
    const tax = parseFloat(formData.taxRate) || 0;
    
    if (price > 0 && cost > 0) {
      const profitAmount = price - cost - (price * (tax / 100));
      const marginPercent = ((profitAmount / price) * 100).toFixed(2);
      setProfit(profitAmount.toFixed(2));
      setMargin(marginPercent);
    } else {
      setProfit(0);
      setMargin(0);
    }
  }, [formData.price, formData.cost, formData.taxRate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSpecification = () => {
    if (currentSpec.key && currentSpec.value) {
      setFormData(prev => ({
        ...prev,
        specifications: [...prev.specifications, { ...currentSpec }]
      }));
      setCurrentSpec({ key: '', value: '' });
    }
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields (Name, Price, Category)');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    // Auto-generate SKU if not provided
    if (!formData.sku) {
      const skuPrefix = formData.category.substring(0, 3).toUpperCase();
      const skuNumber = Date.now().toString().slice(-6);
      formData.sku = `${skuPrefix}-${skuNumber}`;
    }

    onSubmit(formData);
  };

  const generateSKU = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD';
    const suffix = Date.now().toString().slice(-6);
    handleChange('sku', `${prefix}-${suffix}`);
    toast.success('SKU generated automatically');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            Fill in the product details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className="font-medium"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailed product description"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    handleChange('category', value);
                    handleChange('subcategory', '');
                    if (value !== 'Other') {
                      setCustomCategory('');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {Object.keys(PRODUCT_CATEGORIES).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Category Input */}
              {showCustomCategory && (
                <div className="col-span-2">
                  <Label htmlFor="customCategory">Custom Category Name *</Label>
                  <Input
                    id="customCategory"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      handleChange('category', e.target.value || 'Other');
                    }}
                    placeholder="Enter your custom category name"
                    className="border-primary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Type your own category name (e.g., "Cosmetics", "Agriculture", "Real Estate")
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => handleChange('subcategory', value)}
                  disabled={!formData.category || showCustomCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map(subcat => (
                      <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select value={formData.brand} onValueChange={(value) => handleChange('brand', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANDS.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map(cond => (
                      <SelectItem key={cond} value={cond}>
                        {cond.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  placeholder="Supplier or manufacturer"
                />
              </div>
            </div>
          </TabsContent>

          {/* Pricing & Stock Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Selling Price (KES) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cost">Cost Price (KES)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleChange('cost', e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => handleChange('taxRate', e.target.value)}
                  placeholder="16"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Profit Calculation</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Profit:</span>
                    <span className="font-bold text-green-600">KES {profit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margin:</span>
                    <span className="font-bold">{margin}%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <div className="relative">
                  <Box className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="minStock">Minimum Stock Alert</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => handleChange('minStock', e.target.value)}
                  placeholder="5"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="Auto-generated"
                  />
                  <Button type="button" variant="outline" onClick={generateSKU}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="col-span-2 space-y-3 bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured Product</Label>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleChange('featured', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="freeShipping">Free Shipping</Label>
                  <Switch
                    id="freeShipping"
                    checked={formData.freeShipping}
                    onCheckedChange={(checked) => handleChange('freeShipping', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowBackorder">Allow Backorder</Label>
                  <Switch
                    id="allowBackorder"
                    checked={formData.allowBackorder}
                    onCheckedChange={(checked) => handleChange('allowBackorder', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="trackInventory">Track Inventory</Label>
                  <Switch
                    id="trackInventory"
                    checked={formData.trackInventory}
                    onCheckedChange={(checked) => handleChange('trackInventory', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => handleNestedChange('dimensions', 'length', e.target.value)}
                    placeholder="Length"
                  />
                  <Input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                    placeholder="Width"
                  />
                  <Input
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => handleNestedChange('dimensions', 'height', e.target.value)}
                    placeholder="Height"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="barcode">Barcode / EAN</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  placeholder="Enter barcode number"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Specifications</Label>
                <div className="space-y-2 mb-2">
                  <div className="flex gap-2">
                    <Input
                      value={currentSpec.key}
                      onChange={(e) => setCurrentSpec({ ...currentSpec, key: e.target.value })}
                      placeholder="Key (e.g., Color)"
                    />
                    <Input
                      value={currentSpec.value}
                      onChange={(e) => setCurrentSpec({ ...currentSpec, value: e.target.value })}
                      placeholder="Value (e.g., Blue)"
                    />
                    <Button type="button" variant="outline" onClick={addSpecification}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">
                        <strong>{spec.key}:</strong> {spec.value}
                      </span>
                      <X 
                        className="h-4 w-4 cursor-pointer text-destructive" 
                        onClick={() => removeSpecification(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="warranty">Warranty (months)</Label>
                  <Input
                    id="warranty"
                    type="number"
                    value={formData.warranty}
                    onChange={(e) => handleChange('warranty', e.target.value)}
                    placeholder="12"
                  />
                </div>

                <div>
                  <Label htmlFor="returnPolicy">Return Policy (days)</Label>
                  <Input
                    id="returnPolicy"
                    type="number"
                    value={formData.returnPolicy}
                    onChange={(e) => handleChange('returnPolicy', e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SEO & Meta Tab */}
          <TabsContent value="seo" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  placeholder="SEO optimized title"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  placeholder="SEO optimized description"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label htmlFor="image">Product Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">SEO Tips</p>
                    <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                      <li>Use descriptive, keyword-rich titles</li>
                      <li>Include product benefits in description</li>
                      <li>Add relevant tags for better searchability</li>
                      <li>Use high-quality product images</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="px-8">
            <CheckCircle className="mr-2 h-4 w-4" />
            {mode === 'add' ? 'Add Product' : 'Update Product'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedProductForm;
