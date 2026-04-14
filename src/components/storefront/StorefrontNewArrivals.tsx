import { useState } from "react";
import { Link } from "react-router-dom";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { mockProducts } from "@/data/mockData";
import ProductCard from "@/components/ProductCard";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface NewArrivalsData { title: string; subtitle: string; show_count: number; }

const fallback: NewArrivalsData = { title: "New Arrivals", subtitle: "Just landed — the latest additions", show_count: 10 };

const StorefrontNewArrivals = () => {
  const { data: cms } = useStorefrontContent<NewArrivalsData>("new_arrivals", fallback);
  const content = cms?.content || fallback;
  const [page, setPage] = useState(0);
  const perPage = 5;

  const products = [...mockProducts]
    .filter((p) => p.is_active)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, content.show_count || 10);

  if (!cms?.is_active) return null;

  const totalPages = Math.ceil(products.length / perPage);
  const visibleProducts = products.slice(page * perPage, (page + 1) * perPage);

  return (
    <section className="py-6 lg:py-10 bg-muted/15">
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-base lg:text-lg font-bold text-foreground">{content.title}</h2>
              <p className="text-muted-foreground text-[11px] mt-0.5">{content.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 transition-all"><ChevronLeft className="h-3 w-3" /></button>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 transition-all"><ChevronRight className="h-3 w-3" /></button>
              </div>
            )}
            <Link to="/search?sort=newest" className="flex items-center gap-1 text-primary text-[11px] font-semibold group">
              View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 lg:gap-3">
            {visibleProducts.map((p) => {
              const primaryImage = p.images?.find((img) => img.is_primary)?.image_url || p.images?.[0]?.image_url || "/placeholder.svg";
              return (
                <ProductCard key={p.id} name={p.name} brand={p.brand} price={p.price} originalPrice={p.original_price || undefined}
                  image={primaryImage} rating={4.5} reviews={0} vendor={p.vendor?.store_name || "BitStores"}
                  specs={{ ram: p.ram || "", storage: p.storage || "", camera: p.camera || "" }} slug={p.slug} badge="New" condition={p.condition}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border border-dashed border-border bg-card/50">
            <Sparkles className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No new arrivals yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StorefrontNewArrivals;
