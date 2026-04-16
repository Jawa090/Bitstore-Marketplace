import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";

interface RecentlyViewedData {
  title: string;
  show_count: number;
}

const fallback: RecentlyViewedData = {
  title: "Recently Viewed",
  show_count: 8,
};

const StorefrontRecentlyViewed = () => {
  const { data: cms } = useStorefrontContent<RecentlyViewedData>("recently_viewed", fallback);
  const content = cms?.content || fallback;
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setProducts(getRecentlyViewed().slice(0, content.show_count || 8));
  }, [content.show_count]);

  if (!cms?.is_active || products.length === 0) return null;

  return (
    <section className="py-6 lg:py-10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 mb-8"
        >
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl lg:text-3xl font-bold">{content.title}</h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <ProductCard
                name={p.name}
                brand={p.brand}
                price={p.price}
                originalPrice={p.original_price}
                image={p.image}
                rating={4.5}
                reviews={0}
                vendor={p.vendor}
                specs={{ ram: p.ram || "", storage: p.storage || "", camera: p.camera || "" }}
                slug={p.slug}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorefrontRecentlyViewed;
