import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import heroApple from "@/assets/hero-apple.jpg";
import heroSamsung from "@/assets/hero-samsung.jpg";
import heroGoogle from "@/assets/hero-google.jpg";

const localImages: Record<string, string> = {
  "hero-apple": heroApple,
  "hero-samsung": heroSamsung,
  "hero-google": heroGoogle,
};

interface Banner {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  badge_text: string;
}

interface HeroData {
  banners: Banner[];
}

const fallback: HeroData = {
  banners: [{
    title: "Renewed Electronics\nLike New, Way Cheaper",
    subtitle: "Save up to 70% on certified smartphones, laptops & more from trusted UAE vendors",
    cta_text: "Shop Now",
    cta_link: "/search",
    image_url: "",
    badge_text: "Save up to 70%",
  }],
};

const StorefrontHero = () => {
  const { data } = useStorefrontContent<HeroData>("hero_banners", fallback);
  const [current, setCurrent] = useState(0);
  const banners = data?.content?.banners || fallback.banners;

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!data?.is_active) return null;

  const banner = banners[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center relative">
        {banner.image_url && (
          <img
            src={localImages[banner.image_url] || banner.image_url}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover"
            width={1920}
            height={1080}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />

        <div className="container relative z-10 py-12 sm:py-16 lg:py-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="max-w-xl lg:max-w-2xl"
            >
              {banner.badge_text && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-5"
                  style={{
                    background: "hsl(var(--primary) / 0.1)",
                    borderColor: "hsl(var(--primary) / 0.2)",
                    color: "hsl(var(--primary))",
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  {banner.badge_text}
                </motion.span>
              )}

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-[1.1] mb-4 tracking-tight">
                {banner.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {i === 0 ? <span className="text-gradient-premium">{line}</span> : line}
                  </span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md leading-relaxed"
              >
                {banner.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <Link to={banner.cta_link || "/search"}>
                  <Button size="lg" className="px-7 text-sm font-semibold h-11 rounded-xl shadow-lg hover:shadow-xl transition-all" style={{ background: "var(--gradient-accent)", color: "hsl(var(--primary-foreground))" }}>
                    {banner.cta_text || "Shop Now"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/search?condition=refurbished">
                  <Button size="lg" variant="outline" className="px-7 text-sm font-semibold h-11 rounded-xl border-border/80 hover:bg-secondary">
                    <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                    Browse Renewed
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-5 mt-8 text-xs"
              >
                {[
                  { value: "50K+", label: "Happy Customers" },
                  { value: "100%", label: "Verified Sellers" },
                  { value: "12 Mo", label: "Warranty" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground text-sm">{stat.value}</span>
                    <span className="text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/60 backdrop-blur-md text-foreground hover:bg-background/80 transition-all border border-border/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/60 backdrop-blur-md text-foreground hover:bg-background/80 transition-all border border-border/50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default StorefrontHero;
