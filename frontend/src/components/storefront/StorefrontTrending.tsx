import { TrendingUp, ArrowRight, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { mockProducts } from "@/data/mockData";
import ProductCard from "@/components/ProductCard";

interface TrendingData { title: string; subtitle: string; }
const fallback: TrendingData = { title: "Trending Now", subtitle: "Most popular products this week" };

const StorefrontTrending = () => {
  const { data: cms } = useStorefrontContent<TrendingData>("trending_now", fallback);
  const content = cms?.content || fallback;

  // Use first 10 products as "trending"
  const products = mockProducts.filter((p) => p.is_active).slice(0, 10);

  if (!cms?.is_active || products.length === 0) return null;

  return (
    <section className="py-6 lg:py-10 bg-muted/10">
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-base lg:text-lg font-bold text-foreground">{content.title}</h2>
              <p className="text-muted-foreground text-[11px] mt-0.5">{content.subtitle}</p>
            </div>
          </div>
          <Link to="/search" className="flex items-center gap-1 text-primary text-[11px] font-semibold group">
            View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 lg:gap-3">
          {products.slice(0, 10).map((p, i) => {
            const primaryImage = p.images?.find((img) => img.is_primary)?.image_url || p.images?.[0]?.image_url || "/placeholder.svg";
            return (
              <div key={p.id} className="relative">
                {i < 3 && (
                  <div className="absolute -top-1 -left-1 z-10 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-md">
                    {i === 0 ? <Crown className="h-3 w-3" /> : `#${i + 1}`}
                  </div>
                )}
                <ProductCard name={p.name} brand={p.brand} price={p.price} originalPrice={p.original_price || undefined}
                  image={primaryImage} rating={4.5} reviews={0} vendor={p.vendor?.store_name || "BitStores"}
                  specs={{ ram: p.ram || "", storage: p.storage || "", camera: p.camera || "" }} slug={p.slug} condition={p.condition}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StorefrontTrending;
