import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { productService } from "@/services/api/product.service";

const FeaturedProducts = () => {
  // Fetch featured products from backend
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getProducts({ limit: 8 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Top picks from trusted UAE vendors</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Top picks from trusted UAE vendors</p>
          </div>
          <a href="/search" className="hidden sm:block text-primary hover:underline text-sm font-medium">View All →</a>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.slice(0, 8).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <ProductCard 
                name={product.name}
                brand={product.brand?.name || 'Unknown'}
                price={product.price}
                originalPrice={product.original_price}
                image={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'}
                rating={4.5} // TODO: Add rating system
                reviews={0} // TODO: Add review system
                vendor={product.vendor?.store_name || 'BitStores'}
                specs={{ 
                  ram: product.ram || '', 
                  storage: product.storage || '', 
                  camera: product.camera || '' 
                }}
                slug={product.slug}
                badge={product.condition === 'new' ? 'New' : undefined}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

// export default FeaturedProducts;
