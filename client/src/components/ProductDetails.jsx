import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  DollarSign,
  Warehouse,
  Tag,
  Truck,
  Calendar,
  AlertCircle,
  ShoppingCart,
  Heart,
  Share2,
  Info,
  Zap,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ProductDetails = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const getStockStatus = (stock) => {
    if (stock > 20) return { 
      label: "In Stock", 
      variant: "default",
      color: "text-green-600",
      icon: CheckCircle2
    };
    if (stock > 0) return { 
      label: "Low Stock", 
      variant: "secondary",
      color: "text-orange-600",
      icon: AlertCircle
    };
    return { 
      label: "Out of Stock", 
      variant: "destructive",
      color: "text-red-600",
      icon: AlertCircle
    };
  };

  const stockStatus = getStockStatus(product.stockQuantity || 0);
  const StockIcon = stockStatus.icon;
  const currency = product.currency || 'USD';
  const currencySymbol = currency === 'KES' ? 'KES' : '$';
  const totalPrice = (product.price * quantity).toFixed(2);
  const maxQuantity = Math.min(product.stockQuantity || 0, 99);

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} ${product.name} to cart`, {
      description: `Total: $${totalPrice}`,
      icon: '🛒'
    });
    onClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} - $${product.price}`,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites', {
      icon: isFavorite ? '💔' : '❤️'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Product Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this product
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Left Column - Image and Quick Info */}
          <div className="space-y-4">
            {/* Product Image */}
            <div className="aspect-square relative overflow-hidden rounded-xl border-2 border-primary/20 bg-primary/10 shadow-2xl">
              <img
                src={product.image || `https://via.placeholder.com/500x500?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                className="object-cover w-full h-full hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              {product.featured && (
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-white border-0 shadow-lg animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {(product.stockQuantity > 0 && product.stockQuantity <= 5) && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 shadow-lg">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Only {product.stockQuantity} left!
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleFavorite}
              >
                <Heart className={cn("h-4 w-4 mr-2", isFavorite && "fill-red-500 text-red-500")} />
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Product Name and Price */}
            <div className="space-y-3">
              <h3 className="text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg">
                  <span className="text-sm font-medium opacity-90">Price</span>
                  <div className="text-3xl font-bold">
                    {currencySymbol} {product.price?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <Badge variant={stockStatus.variant} className="gap-2 px-4 py-2 text-base">
                  <StockIcon className="h-4 w-4" />
                  {stockStatus.label}
                </Badge>
              </div>
              {product.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <Separator />

            {/* Product Information Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 hover:shadow-md transition-shadow">
                <Tag className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="font-semibold">{product.category || "Uncategorized"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 hover:shadow-md transition-shadow">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SKU</p>
                  <p className="font-semibold font-mono">{product.sku || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 hover:shadow-md transition-shadow">
                <Warehouse className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Stock</p>
                  <p className={cn("font-semibold text-lg", stockStatus.color)}>
                    {product.stockQuantity || 0} units
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 hover:shadow-md transition-shadow">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reorder Level</p>
                  <p className="font-semibold">{product.reorderLevel || 5} units</p>
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            {product.supplierName && (
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                  <p className="font-semibold">{product.supplierName}</p>
                </div>
              </div>
            )}


            <Separator />

            {/* Quantity Selector and Add to Cart */}
            {product.stockQuantity > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={quantity >= maxQuantity}
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    (Max: {maxQuantity})
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 bg-primary/15 rounded-xl border-2 border-primary/30 shadow-inner">
                  <span className="text-lg font-semibold">Total Price:</span>
                  <span className="text-3xl font-bold text-green-600">
                    {currencySymbol} {totalPrice}
                  </span>
                </div>

                <Button 
                  className="w-full gap-2 h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            )}

            {product.stockQuantity === 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-semibold">This product is currently out of stock</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Please check back later or contact us for availability.
                </p>
              </div>
            )}

            {/* Additional Information */}
            {product.createdAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Added on {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;
