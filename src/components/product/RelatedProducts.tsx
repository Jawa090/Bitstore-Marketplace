import { Link } from "react-router-dom";
import { getRelatedProducts } from "@/data/mockData";

interface RelatedProductsProps {
  currentProductId: string;
  brand: string;
}

const RelatedProducts = ({ currentProductId, brand }: RelatedProductsProps) => {
  const products = getRelatedProducts(currentProductId, brand);

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">You May Also Like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => {
          const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;
          const image = product.images?.find((i) => i.is_primary)?.image_url || product.images?.[0]?.image_url || "/placeholder.svg";
          return (
            <Link key={product.id} to={`/product/${product.slug}`} className="group rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors">
              <div className="aspect-square bg-secondary/30 overflow-hidden relative">
                <img src={image} alt={product.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                {discount > 0 && <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold">-{discount}%</span>}
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <h4 className="text-sm font-medium line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">{product.name}</h4>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {product.storage && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{product.storage}</span>}
                  {product.condition && product.condition !== "new" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground capitalize">{product.condition.replace(/_/g, " ")}</span>}
                </div>
                <div className="mt-2">
                  <span className="text-sm font-bold">{product.currency} {product.price.toLocaleString()}</span>
                  {product.original_price && <span className="text-[10px] text-muted-foreground line-through ml-1.5">{product.currency} {product.original_price.toLocaleString()}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;
