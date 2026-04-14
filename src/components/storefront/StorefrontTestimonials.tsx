import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  avatar_url?: string;
  product?: string;
}

interface TestimonialsData {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

const fallback: TestimonialsData = {
  title: "What Our Customers Say",
  subtitle: "Trusted by thousands across the UAE",
  testimonials: [
    { name: "Ahmed K.", location: "Dubai", text: "Got an iPhone 15 Pro in like-new condition for half the retail price. Looks and works perfectly!", rating: 5, product: "iPhone 15 Pro" },
    { name: "Sara M.", location: "Abu Dhabi", text: "Fast delivery and the MacBook was exactly as described. The warranty gives peace of mind.", rating: 5, product: "MacBook Air M2" },
    { name: "Raj P.", location: "Sharjah", text: "Best marketplace for renewed electronics in UAE. Already bought 3 devices from here.", rating: 5, product: "Samsung Galaxy S24" },
    { name: "Fatima A.", location: "Dubai", text: "The AI assistant helped me pick the perfect phone for my budget. Great experience!", rating: 5, product: "iPhone 14" },
    { name: "Omar H.", location: "Ajman", text: "Ordered a refurbished iPad Pro — came in perfect condition with original accessories. Saved 40%!", rating: 5, product: "iPad Pro 12.9" },
    { name: "Layla S.", location: "Dubai", text: "Same-day delivery and the phone was factory sealed. Can't tell it's renewed. Highly recommend!", rating: 5, product: "Samsung Galaxy Z Flip5" },
  ],
};

const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500",
  "bg-rose-500", "bg-amber-500", "bg-teal-500",
];

const StorefrontTestimonials = () => {
  const { data } = useStorefrontContent<TestimonialsData>("testimonials", fallback);
  const content = data?.content || fallback;

  const [active, setActive] = useState(0);
  const total = content.testimonials.length;

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [total]);

  const prev = () => setActive((p) => (p - 1 + total) % total);
  const next = () => setActive((p) => (p + 1) % total);
  const t = content.testimonials[active];

  return (
    <section className="py-10 lg:py-14 bg-card/50 border-y border-border/30">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 mb-3">
            <div className="flex gap-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-warning text-warning" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-foreground">4.9/5</span>
            <span className="text-[10px] text-muted-foreground">· 12,000+ reviews</span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-foreground">{content.title}</h2>
          <p className="text-muted-foreground text-xs mt-0.5">{content.subtitle}</p>
        </div>

        {/* Testimonial */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-background rounded-xl border border-border/60 p-6 lg:p-8 relative overflow-hidden"
            >
              <Quote className="absolute top-4 right-4 h-12 w-12 text-primary/[0.04]" />

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-4 w-4 ${si < t.rating ? "fill-warning text-warning" : "text-muted-foreground/20"}`}
                  />
                ))}
              </div>

              <blockquote className="text-sm lg:text-base text-foreground/90 leading-relaxed font-medium mb-6 max-w-2xl">
                "{t.text}"
              </blockquote>

              <div className="flex items-center gap-3">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-xs ${avatarColors[active % avatarColors.length]}`}>
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-success">
                      <ShieldCheck className="h-2.5 w-2.5" /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.location}
                    {t.product && <span> · <span className="text-foreground/70 font-medium">{t.product}</span></span>}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={prev} className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-all">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex gap-1">
              {content.testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-5 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/40"}`}
                />
              ))}
            </div>
            <button onClick={next} className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-all">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorefrontTestimonials;
