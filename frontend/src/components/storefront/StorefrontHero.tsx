import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Smartphone, Laptop, Headphones, Watch, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import heroApple from "@/assets/hero-apple.jpg";
import heroSamsung from "@/assets/hero-samsung.jpg";
import heroGoogle from "@/assets/hero-google.jpg";
import heroPhones from "@/assets/hero-phones.jpg";
import bannerAccessories from "@/assets/banner-accessories.jpg";

const localImages: Record<string, string> = {
  "hero-apple": heroApple,
  "hero-samsung": heroSamsung,
  "hero-google": heroGoogle,
  "hero-phones": heroPhones,
  "banner-accessories": bannerAccessories,
};

// Enhanced hero slides with multiple categories
const heroSlides = [
  {
    id: 1,
    category: "Phones",
    icon: Smartphone,
    title: "Renewed Electronics\nLike New, Way Cheaper",
    subtitle: "Save up to 70% on certified smartphones, laptops & more from trusted UAE vendors",
    badge_text: "Save up to 70%",
    cta_text: "Shop Now",
    cta_link: "/search",
    secondary_cta: "Browse Renewed",
    secondary_link: "/search?condition=refurbished",
    image_url: "hero-phones",
    gradient: "from-blue-500/10 via-purple-500/10 to-pink-500/10"
  },
  {
    id: 2,
    category: "Laptops",
    icon: Laptop,
    title: "Premium Laptops\nPerformance Redefined",
    subtitle: "Discover high-performance laptops from top brands with warranty and fast delivery",
    badge_text: "Latest Models",
    cta_text: "Explore Laptops",
    cta_link: "/search?category=laptops",
    secondary_cta: "Compare Models",
    secondary_link: "/compare",
    image_url: "hero-apple",
    gradient: "from-gray-500/10 via-slate-500/10 to-zinc-500/10"
  },
  {
    id: 3,
    category: "Accessories",
    icon: Headphones,
    title: "Smart Accessories\nComplete Your Setup",
    subtitle: "Premium headphones, cases, chargers and more to enhance your tech experience",
    badge_text: "Best Sellers",
    cta_text: "Shop Accessories",
    cta_link: "/search?category=accessories",
    secondary_cta: "View Bundles",
    secondary_link: "/bundles",
    image_url: "banner-accessories",
    gradient: "from-green-500/10 via-teal-500/10 to-cyan-500/10"
  },
  {
    id: 4,
    category: "Wearables",
    icon: Watch,
    title: "Smart Wearables\nStay Connected",
    subtitle: "Apple Watch, Samsung Galaxy Watch and more with health tracking features",
    badge_text: "Health & Fitness",
    cta_text: "Shop Watches",
    cta_link: "/search?category=wearables",
    secondary_cta: "Health Features",
    secondary_link: "/health",
    image_url: "hero-samsung",
    gradient: "from-orange-500/10 via-red-500/10 to-pink-500/10"
  },
  {
    id: 5,
    category: "Gaming",
    icon: Gamepad2,
    title: "Gaming Gear\nLevel Up Your Game",
    subtitle: "Gaming phones, controllers, and accessories for the ultimate gaming experience",
    badge_text: "Pro Gaming",
    cta_text: "Gaming Zone",
    cta_link: "/search?category=gaming",
    secondary_cta: "Esports Gear",
    secondary_link: "/esports",
    image_url: "hero-google",
    gradient: "from-violet-500/10 via-purple-500/10 to-indigo-500/10"
  }
];

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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Use enhanced slides instead of basic banners
  const slides = heroSlides;

  // Auto-slide functionality with 5-second intervals
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  if (!data?.is_active) return null;

  const currentSlide = slides[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center relative">
        {/* Background Images with Smooth Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={localImages[currentSlide.image_url] || currentSlide.image_url}
              alt={currentSlide.category}
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />
            {/* Very subtle category-specific gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.gradient} opacity-40`} />
          </motion.div>
        </AnimatePresence>

        {/* Minimal overlay gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background/90 backdrop-blur-sm border border-border/50 rounded-full p-2 transition-all duration-200 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background/90 backdrop-blur-sm border border-border/50 rounded-full p-2 transition-all duration-200 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>

        {/* Content */}
        <div className="container relative z-10 py-12 sm:py-16 lg:py-20">
          <div className="max-w-xl lg:max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Badge */}
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-5"
                  style={{
                    background: "hsl(var(--primary) / 0.1)",
                    borderColor: "hsl(var(--primary) / 0.2)",
                    color: "hsl(var(--primary))"
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  {currentSlide.badge_text}
                </motion.span>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-[1.1] mb-4 tracking-tight drop-shadow-lg"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {currentSlide.title.split("\n").map((line, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {i === 0 ? <span className="text-gradient-premium">{line}</span> : line}
                    </span>
                  ))}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md leading-relaxed drop-shadow-md"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
                >
                  {currentSlide.subtitle}
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <Link to={currentSlide.cta_link}>
                    <Button
                      size="lg"
                      className="px-7 text-sm font-semibold h-11 rounded-xl shadow-lg hover:shadow-xl transition-all"
                      style={{
                        background: "var(--gradient-accent)",
                        color: "hsl(var(--primary-foreground))"
                      }}
                    >
                      {currentSlide.cta_text}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Link to={currentSlide.secondary_link}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-7 text-sm font-semibold h-11 rounded-xl border-border/80 hover:bg-secondary"
                    >
                      <currentSlide.icon className="mr-2 h-3.5 w-3.5 text-primary" />
                      {currentSlide.secondary_cta}
                    </Button>
                  </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === current
                  ? "bg-primary w-8"
                  : "bg-background/60 hover:bg-background/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Category Indicator */}
        <div className="absolute top-6 right-6 z-20 bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <currentSlide.icon className="h-4 w-4 text-primary" />
            {currentSlide.category}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorefrontHero;