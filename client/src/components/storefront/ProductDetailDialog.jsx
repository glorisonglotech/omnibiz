import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, ShoppingCart, Truck, Shield, Package, Heart } from "lucide-react";
import { useState } from "react";

const ProductDetailDialog = ({ product, open, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const averageRating = product.rating || 4.5;
  const reviewCount = product.reviews?.length || 12;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-secondary/30 to-primary/10 rounded-xl flex items-center justify-center overflow-hidden">
              <Package className="h-32 w-32 text-primary/40" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-primary text-primary" : ""}`} />
                </Button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(averageRating)
                          ? "fill-warning text-warning"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating} ({reviewCount} reviews)
                </span>
              </div>
              <p className="text-3xl font-bold text-primary">KES {(Number(product.price) || 0).toFixed(2)}</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2 text-foreground">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {product.specs && product.specs.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Specifications</h3>
                  <ul className="space-y-1">
                    {product.specs.map((spec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator />

            {/* Stock and Delivery Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-success" />
                <span className={(product.stockQuantity || product.stock || 0) > 10 ? "text-success" : "text-warning"}>
                  {(product.stockQuantity || product.stock || 0) > 10 ? "In Stock" : `Only ${product.stockQuantity || product.stock || 0} left`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>Free delivery on orders over KES 1,000</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment & 7-day return policy</span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3 pt-4">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-r-none"
                >
                  -
                </Button>
                <span className="px-4 font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stockQuantity || product.stock || 0, quantity + 1))}
                  className="rounded-l-none"
                >
                  +
                </Button>
              </div>
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    onAddToCart(product);
                  }
                  onClose();
                }}
                disabled={(product.stockQuantity || product.stock || 0) === 0}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <>
            <Separator className="my-6" />
            <div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Customer Reviews</h3>
              <div className="space-y-4">
                {product.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {review.author.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{review.author}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? "fill-warning text-warning" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;