import { useState } from "react";
import { ShoppingCart, Heart, Minus, Plus, Truck, RotateCcw, ShieldCheck, Zap, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface AddToCartProps {
  productId: string;
  price: number;
  originalPrice?: number | null;
  currency?: string;
  stock: number;
  productName: string;
  imageUrl?: string;
  vendorId: string;
  vendorName: string;
  slug: string;
}

const AddToCart = ({
  productId, price, originalPrice, currency = "AED", stock, productName,
  imageUrl, vendorId, vendorName, slug,
}: AddToCartProps) => {
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  const inStock = stock > 0;
  const now = new Date();
  const expressDate = format(addDays(now, 1), "EEE, dd MMM");

  const handleAddToCart = () => {
    addItem({
      productId, name: productName, price, currency, imageUrl,
      vendorId, vendorName, slug, stock, quantity,
    });
    toast({ title: "Added to cart", description: `${quantity}× ${productName} added.` });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {/* Price block */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{currency} {price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{currency} {originalPrice.toLocaleString()}</span>
          )}
          {discount > 0 && (
            <span className="text-sm font-semibold text-primary">-{discount}%</span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">Inclusive of VAT</p>
      </div>

      {/* Delivery */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 text-sm">
          <Zap className="h-4 w-4 text-primary shrink-0" />
          <div>
            <span className="font-medium">Express: </span>
            <span className="text-muted-foreground">Get it by <span className="font-medium text-foreground">{expressDate}</span></span>
          </div>
          <span className="ml-auto text-xs font-semibold text-primary">FREE</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Standard: 2-4 business days</span>
          <span className="ml-auto text-xs font-semibold text-muted-foreground">FREE</span>
        </div>
      </div>

      {/* Stock */}
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${inStock ? "bg-primary" : "bg-destructive"}`} />
        <span className="text-sm font-medium">
          {inStock ? (
            <>
              <span className="text-primary">In Stock</span>
              {stock <= 5 && <span className="text-destructive ml-1">— Only {stock} left!</span>}
            </>
          ) : (
            <span className="text-destructive">Out of Stock</span>
          )}
        </span>
      </div>

      {/* Quantity */}
      {inStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Qty:</span>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 hover:bg-muted transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-4 text-sm font-semibold min-w-[40px] text-center border-x border-border">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              className="p-2 hover:bg-muted transition-colors"
              disabled={quantity >= stock}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="space-y-2">
        <Button
          size="lg"
          className="w-full h-12 text-sm font-bold rounded-xl"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="w-full h-11 text-sm font-semibold rounded-xl"
          disabled={!inStock}
          onClick={() => {
            handleAddToCart();
            window.location.href = "/checkout";
          }}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Buy Now
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`w-full text-sm gap-2 ${wishlisted ? "text-destructive" : "text-muted-foreground"}`}
          onClick={() => {
            setWishlisted(!wishlisted);
            toast({ title: wishlisted ? "Removed from wishlist" : "Added to wishlist" });
          }}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive" : ""}`} />
          {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
        </Button>
      </div>

      {/* Trust strip */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>12-Month Warranty</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>7-Day Returns</span>
        </div>
      </div>

      {/* Sold by */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
        <span>Sold by <span className="font-medium text-foreground">{vendorName}</span></span>
      </div>
    </div>
  );
};

export default AddToCart;
