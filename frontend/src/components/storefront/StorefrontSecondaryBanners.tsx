import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { useThemeImage } from "@/hooks/useThemeImage";

interface BannerItem {
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  bg_color?: string;
}

interface SecondaryBannersData {
  banners: BannerItem[];
}

const StorefrontSecondaryBanners = () => {
  const tradeinImg = useThemeImage("tradein");
  const accessoriesImg = useThemeImage("accessories");

  const localImages: Record<string, string> = {
    "banner-tradein": tradeinImg,
    "banner-accessories": accessoriesImg,
  };

  const fallback: SecondaryBannersData = {
    banners: [
      { title: "Trade-In Your Old Device", subtitle: "Get up to 1,500 AED credit", image_url: "banner-tradein", link: "/trade-in", bg_color: "" },
      { title: "Certified Accessories", subtitle: "Cases, chargers & more from 29 AED", image_url: "banner-accessories", link: "/accessories", bg_color: "" },
    ],
  };


  const { data } = useStorefrontContent<SecondaryBannersData>("secondary_banners", fallback);
  if (!data?.is_active) return null;
  const content = data.content;

  return (
    <section className="py-6 lg:py-10">
      <div className="container">
        <div className={`grid gap-4 lg:gap-6 ${content.banners.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
          {content.banners.map((banner, i) => {
            const imgSrc = localImages[banner.image_url] || banner.image_url;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={banner.link || "/search"}
                  className="group relative block rounded-2xl overflow-hidden min-h-[220px] lg:min-h-[260px] border border-border/50"
                  style={{ boxShadow: "0 8px 32px -8px hsl(var(--primary) / 0.15)" }}
                >
                  {imgSrc ? (
                    <img src={imgSrc} alt={banner.title} loading="lazy" width={960} height={512} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: "var(--gradient-card)" }} />
                  )}
                  {/* Gradient overlays for readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  
                  {/* Glow accent */}
                  <div className="absolute bottom-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-primary/0 group-hover:w-2/3 transition-all duration-500" />
                  
                  <div className="relative z-10 p-6 lg:p-8 flex flex-col justify-center h-full">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 w-fit mb-3">
                      {i === 0 ? "♻️ Trade-In" : "✅ Certified"}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{banner.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">{banner.subtitle}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all duration-300">
                      Learn More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StorefrontSecondaryBanners;
