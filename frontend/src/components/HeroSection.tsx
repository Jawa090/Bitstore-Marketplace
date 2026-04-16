import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Smartphone, Laptop, Headphones, Watch, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import images properly for Vite
import heroPhones from "@/assets/hero-phones.jpg";
import heroApple from "@/assets/hero-apple.jpg";
import bannerAccessories from "@/assets/banner-accessories.jpg";
import heroSamsung from "@/assets/hero-samsung.jpg";
import heroGoogle from "@/assets/hero-google.jpg";

// Hero slides data with categories and content
const heroSlides = [
  {
    id: 1,
    category: "Phones",
    icon: Smartphone,
    title: "Renewed Electronics",
    subtitle: "Like New, Way Cheaper",
    description: "Save up to 70% on certified smartphones, laptops & more from trusted UAE vendors",
    badge: "Save up to 70%",
    primaryButton: { text: "Shop Now", link: "/search" },
    secondaryButton: { text: "Browse Renewed", link: "/search?condition=refurbished" },
    image: heroPhones,
    gradient: "from-blue-600/20 via-purple-600/20 to-pink-600/20"
  },
  {
    id: 2,
    category: "Laptops",
    icon: Laptop,
    title: "Premium Laptops",
    subtitle: "Performance Redefined",
    description: "Discover high-performance laptops from top brands with warranty and fast delivery",
    badge: "Latest Models",
    primaryButton: { text: "Explore Laptops", link: "/search?category=laptops" },
    secondaryButton: { text: "Compare Models", link: "/compare" },
    image: heroApple,
    gradient: "from-gray-600/20 via-slate-600/20 to-zinc-600/20"
  },
  {
    id: 3,
    category: "Accessories",
    icon: Headphones,
    title: "Smart Accessories",
    subtitle: "Complete Your Setup",
    description: "Premium headphones, cases, chargers and more to enhance your tech experience",
    badge: "Best Sellers",
    primaryButton: { text: "Shop Accessories", link: "/search?category=accessories" },
    secondaryButton: { text: "View Bundles", link: "/bundles" },
    image: bannerAccessories,
    gradient: "from-green-600/20 via-teal-600/20 to-cyan-600/20"
  },
  {
    id: 4,
    category: "Wearables",
    icon: Watch,
    title: "Smart Wearables",
    subtitle: "Stay Connected",
    description: "Apple Watch, Samsung Galaxy Watch and more with health tracking features",
    badge: "Health & Fitness",
    primaryButton: { text: "Shop Watches", link: "/search?category=wearables" },
    secondaryButton: { text: "Health Features", link: "/health" },
    image: heroSamsung,
    gradient: "from-orange-600/20 via-red-600/20 to-pink-600/20"
  },
  {
    id: 5,
    category: "Gaming",
    icon: Gamepad2,
    title: "Gaming Gear",
    subtitle: "Level Up Your Game",
    description: "Gaming phones, controllers, and accessories for the ultimate gaming experience",
    badge: "Pro Gaming",
    primaryButton: { text: "Gaming Zone", link: "/search?category=gaming" },
    secondaryButton: { text: "Esports Gear", link: "/esports" },
    image: heroGoogle,
    gradient: "from-violet-600/20 via-purple-600/20 to-indigo-600/20"
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center relative">
        {/* Background Images with Smooth Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={currentSlideData.image}
              alt={currentSlideData.category}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.gradient}`} />
          </motion.div>
        </AnimatePresence>

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />

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
                key={currentSlide}
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
                  {currentSlideData.badge}
                </motion.span>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-[1.1] mb-4 tracking-tight"
                >
                  <span className="text-gradient-premium">{currentSlideData.title}</span>
                  <br />
                  <span>{currentSlideData.subtitle}</span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md leading-relaxed"
                >
                  {currentSlideData.description}
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <Button
                    className="inline-flex items-center justify-center gap-2 px-7 text-sm font-semibold h-11 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    style={{
                      background: "var(--gradient-accent)",
                      color: "hsl(var(--primary-foreground))"
                    }}
                  >
                    {currentSlideData.primaryButton.text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="inline-flex items-center justify-center gap-2 px-7 text-sm font-semibold h-11 rounded-xl border-border/80 hover:bg-secondary"
                  >
                    <currentSlideData.icon className="mr-2 h-3.5 w-3.5 text-primary" />
                    {currentSlideData.secondaryButton.text}
                  </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-5 mt-8 text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground text-sm">50K+</span>
                    <span className="text-muted-foreground">Happy Customers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground text-sm">100%</span>
                    <span className="text-muted-foreground">Verified Sellers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground text-sm">12 Mo</span>
                    <span className="text-muted-foreground">Warranty</span>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
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
            <currentSlideData.icon className="h-4 w-4 text-primary" />
            {currentSlideData.category}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
