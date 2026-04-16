import { Link } from "react-router-dom";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { mockProducts } from "@/data/mockData";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";

interface FeaturedData {
  title: string;
  subtitle: string;
  show_count: number;
}

const fallback: FeaturedData = {
  title: "Recommended for You",
  subtitle: "Top picks from trusted UAE vendors",
  show_count: 8,
};

const StorefrontFeatured = () => {
  const { data: cms } = useStorefrontContent<FeaturedData>("featured_products", fallback);
  const content = cms?.content || fallback;
  const products = mockProducts.filter((p) => p.is_active).slice(0, content.show_count || 8);

  if (!cms?.is_active) return null;

  return (
    <section className="py-6 lg:py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base lg:text-lg font-bold text-foreground">{content.title}</h2>
            <p className="text-muted-foreground text-[11px] mt-0.5">{content.subtitle}</p>
          </div>
          <Link to="/search" className="flex items-center gap-1 text-primary text-[11px] font-semibold group">
            View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 lg:gap-3">
            {products.map((p) => {
              const primaryImage = p.images?.find((img) => img.is_primary)?.image_url || p.images?.[0]?.image_url || "/placeholder.svg";
              return (
                <ProductCard
                  key={p.id}
                  name={p.name}
                  brand={p.brand}
                  price={p.price}
                  originalPrice={p.original_price || undefined}
                  image={primaryImage}
                  rating={4.5}
                  reviews={0}
                  vendor={p.vendor?.store_name || "BitStores"}
                  specs={{ ram: p.ram || "", storage: p.storage || "", camera: p.camera || "" }}
                  slug={p.slug}
                  condition={p.condition}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border border-dashed border-border bg-card/50">
            <p className="text-xs text-muted-foreground">No products yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StorefrontFeatured;
