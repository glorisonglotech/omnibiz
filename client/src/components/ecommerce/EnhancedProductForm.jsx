import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Image as ImageIcon, 
  Upload, 
  Link2, 
  X, 
  Check,
  AlertCircle,
  Loader2,
  DollarSign,
  Package,
  Tag,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EnhancedProductForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  mode = 'add' // 'add' or 'edit'
}) => {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    sku: "",
    category: "",
    stockQuantity: "",
    reorderLevel: "",
    price: "",
    supplierName: "",
    description: "",
    images: [],
    tags: "",
    barcode: "",
    weight: "",
    dimensions: ""
  });

  const [imageMethod, setImageMethod] = useState("url"); // 'url', 'upload', 'drag'
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFromUrl = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    setIsLoadingImage(true);
    try {
      // Validate URL
      const url = new URL(imageUrl);
      
      // Check if image loads
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: imageUrl, type: 'url' }]
      }));
      setImageUrl("");
      toast.success("Image added successfully!");
    } catch (error) {
      toast.error("Invalid image URL or image failed to load");
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsLoadingImage(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { 
            url: e.target.result, 
            type: 'upload',
            name: file.name,
            size: file.size
          }]
        }));
        toast.success("Image uploaded successfully!");
        setIsLoadingImage(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsLoadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
      setIsLoadingImage(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.info("Image removed");
  };

  const handleSubmit = async () => {
    // Validation
    const requiredFields = ['name', 'sku', 'category', 'stockQuantity', 'price', 'supplierName'];
    const emptyFields = requiredFields.filter(field => !formData[field]?.toString().trim());
    
    if (emptyFields.length > 0) {
      toast.error(`Please fill in: ${emptyFields.join(', ')}`);
      return;
    }

    // Sanitize data
    const sanitizedData = {
      ...formData,
      stockQuantity: Number(formData.stockQuantity),
      reorderLevel: Number(formData.reorderLevel) || 0,
      price: Number(formData.price),
      weight: formData.weight ? Number(formData.weight) : null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    await onSubmit(sanitizedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Enter product details including images and specifications' 
              : 'Update product information and images'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images ({formData.images.length})</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Premium Hair Shampoo"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    SKU *
                  </Label>
                  <Input
                    id="sku"
                    placeholder="e.g., SHP-001"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Hair Care"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Input
                    id="supplier"
                    placeholder="e.g., Beauty Supplies Co."
                    value={formData.supplierName}
                    onChange={(e) => handleChange('supplierName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleChange('stockQuantity', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorder">Reorder Level</Label>
                  <Input
                    id="reorder"
                    type="number"
                    min="0"
                    placeholder="10"
                    value={formData.reorderLevel}
                    onChange={(e) => handleChange('reorderLevel', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description, features, benefits..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="resize-none h-24"
                />
              </div>
            </TabsContent>

            {/* Images */}
            <TabsContent value="images" className="space-y-4 mt-4">
              <Tabs value={imageMethod} onValueChange={setImageMethod}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="url" className="gap-2">
                    <Link2 className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="drag" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Drag & Drop
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-3 mt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleImageFromUrl()}
                      disabled={isLoadingImage}
                    />
                    <Button 
                      onClick={handleImageFromUrl}
                      disabled={isLoadingImage || !imageUrl.trim()}
                    >
                      {isLoadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste image URL and press Enter or click the button
                  </p>
                </TabsContent>

                <TabsContent value="upload" className="space-y-3 mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="hidden"
                    multiple={false}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoadingImage}
                    className="w-full h-24 border-dashed border-2"
                  >
                    {isLoadingImage ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6" />
                        <span>Click to upload image</span>
                        <span className="text-xs text-muted-foreground">Max 5MB</span>
                      </div>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="drag" className="space-y-3 mt-4">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      dragActive ? "border-primary bg-primary/10" : "border-border",
                      isLoadingImage && "opacity-50 cursor-not-allowed"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {isLoadingImage ? (
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    ) : (
                      <>
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium">Drop image here</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Supports JPG, PNG, GIF, WebP (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Image Gallery */}
              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Product Images ({formData.images.length})</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Badge 
                          variant="secondary" 
                          className="absolute bottom-1 left-1 text-xs"
                        >
                          {img.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No images added yet</p>
                  <p className="text-xs mt-1">Add product images using any method above</p>
                </div>
              )}
            </TabsContent>

            {/* Advanced */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="organic, bestseller, new arrival"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    placeholder="123456789012"
                    value={formData.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (L × W × H cm)</Label>
                <Input
                  id="dimensions"
                  placeholder="e.g., 10 × 5 × 15"
                  value={formData.dimensions}
                  onChange={(e) => handleChange('dimensions', e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Check className="h-4 w-4" />
            {mode === 'add' ? 'Add Product' : 'Update Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedProductForm;
