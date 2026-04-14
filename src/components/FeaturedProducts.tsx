import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

const products = [
  {
    name: "iPhone 16 Pro Max 256GB",
    brand: "Apple",
    price: 4899,
    originalPrice: 5299,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 342,
    vendor: "BitStores Dubai",
    specs: { ram: "8GB", storage: "256GB", camera: "48MP" },
    badge: "Best Seller",
    slug: "iphone-16-pro-max-256gb",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 4199,
    originalPrice: 4699,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 218,
    vendor: "MobileHub UAE",
    specs: { ram: "12GB", storage: "512GB", camera: "200MP" },
    slug: "samsung-galaxy-s24-ultra",
  },
  {
    name: "Google Pixel 9 Pro",
    brand: "Google",
    price: 3299,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 156,
    vendor: "TechZone Sharjah",
    specs: { ram: "16GB", storage: "256GB", camera: "50MP" },
    badge: "New",
    slug: "google-pixel-9-pro",
  },
  {
    name: "OnePlus 12 5G",
    brand: "OnePlus",
    price: 2799,
    originalPrice: 3199,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 89,
    vendor: "BitStores Sharjah",
    specs: { ram: "16GB", storage: "256GB", camera: "50MP" },
    slug: "oneplus-12-5g",
  },
];

const FeaturedProducts = () => {
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">Featured Phones</h2>
            <p className="text-muted-foreground">Top picks from trusted UAE vendors</p>
          </div>
          <a href="/search" className="hidden sm:block text-primary hover:underline text-sm font-medium">View All →</a>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <ProductCard {...p} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
