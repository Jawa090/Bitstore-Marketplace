import { ExternalLink, GitCompareArrows } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "./BitBotChat";

interface Props {
  product: Product;
  onCompare: () => void;
  isComparing: boolean;
}

const BitBotProductCard = ({ product, onCompare, isComparing }: Props) => {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
      {/* Image */}
      <div className="h-16 w-16 rounded-lg bg-secondary shrink-0 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
            No img
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{product.name}</p>
        <p className="text-[10px] text-muted-foreground">{product.brand} · {product.storage || "N/A"}</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-sm font-bold text-primary">{product.currency} {product.price.toLocaleString()}</span>
          {product.original_price && (
            <span className="text-[10px] text-muted-foreground line-through">
              {product.currency} {product.original_price.toLocaleString()}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] font-medium" style={{ color: "hsl(142 71% 45%)" }}>-{discount}%</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 mt-2">
          <Link
            to={`/product/${product.slug}`}
            target="_blank"
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"
          >
            View <ExternalLink className="h-3 w-3" />
          </Link>
          <button
            onClick={onCompare}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
              isComparing
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <GitCompareArrows className="h-3 w-3" />
            {isComparing ? "Selected" : "Compare"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BitBotProductCard;
