import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  vendor: string;
  specs: { ram: string; storage: string; camera: string };
  badge?: string;
  slug?: string;
  condition?: string;
}

const conditionColors: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  used_like_new: "bg-primary/10 text-primary",
  refurbished: "bg-accent/10 text-accent",
  used_good: "bg-muted text-muted-foreground",
  used_fair: "bg-muted text-muted-foreground",
};

const conditionLabels: Record<string, string> = {
  new: "New",
  used_like_new: "Like New",
  refurbished: "Refurbished",
  used_good: "Good",
  used_fair: "Fair",
};

const ProductCard = ({
  name, brand, price, originalPrice, image, rating, reviews, vendor, specs, badge, slug, condition,
}: ProductCardProps) => {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <Link to={slug ? `/product/${slug}` : "#"} className="block group">
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden transition-all duration-200 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5">
        {/* Image */}
        <div className="relative aspect-square bg-muted/15 overflow-hidden">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
            {badge && (
              <Badge className="bg-primary text-primary-foreground border-0 text-[8px] font-bold px-1.5 py-0 h-4">
                {badge}
              </Badge>
            )}
            {condition && conditionLabels[condition] && (
              <Badge className={`${conditionColors[condition] || "bg-muted text-muted-foreground"} border-0 text-[8px] font-bold px-1.5 py-0 h-4`}>
                <ShieldCheck className="h-2 w-2 mr-0.5" />
                {conditionLabels[condition]}
              </Badge>
            )}
          </div>

          {discount > 0 && (
            <Badge className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground border-0 text-[8px] font-bold px-1.5 py-0 h-4">
              -{discount}%
            </Badge>
          )}

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all border border-border/40"
          >
            <Heart className="h-3 w-3" />
          </button>
        </div>

        {/* Info */}
        <div className="p-2.5">
          <p className="text-[9px] text-muted-foreground truncate mb-0.5">{brand} · {vendor}</p>
          <h3 className="font-semibold text-[11px] mb-1 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[2em]">{name}</h3>

          {(specs.storage || specs.ram) && (
            <div className="flex flex-wrap gap-0.5 mb-1.5">
              {specs.storage && <span className="text-[8px] px-1 py-px rounded bg-muted text-muted-foreground font-medium">{specs.storage}</span>}
              {specs.ram && <span className="text-[8px] px-1 py-px rounded bg-muted text-muted-foreground font-medium">{specs.ram}</span>}
            </div>
          )}

          <div className="flex items-center gap-0.5 mb-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-2.5 w-2.5 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
            ))}
            <span className="text-[8px] text-muted-foreground ml-0.5">({reviews || "New"})</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-[13px] font-bold text-foreground">AED {price.toLocaleString()}</span>
              {originalPrice && (
                <span className="block text-[9px] text-muted-foreground line-through">AED {originalPrice.toLocaleString()}</span>
              )}
            </div>
            <Button
              size="icon"
              className="h-7 w-7 rounded-md shrink-0"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <ShoppingCart className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
