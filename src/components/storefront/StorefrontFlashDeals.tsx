import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { Button } from "@/components/ui/button";

interface FlashDealsData {
  title: string;
  subtitle: string;
  show_count: number;
}

const fallback: FlashDealsData = {
  title: "Flash Deals",
  subtitle: "Limited time offers — grab them before they're gone!",
  show_count: 4,
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
        <span className="text-lg sm:text-xl font-bold font-mono text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] text-white/60 mt-1 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}

function Countdown({ endDate }: { endDate: string }) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
      setT({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div className="flex items-center gap-1.5">
      <CountdownUnit value={t.h} label="HRS" />
      <span className="text-white/40 font-bold text-sm -mt-3">:</span>
      <CountdownUnit value={t.m} label="MIN" />
      <span className="text-white/40 font-bold text-sm -mt-3">:</span>
      <CountdownUnit value={t.s} label="SEC" />
    </div>
  );
}

const StorefrontFlashDeals = () => {
  const { data: cms } = useStorefrontContent<FlashDealsData>("flash_deals_section", fallback);
  const content = cms?.content || fallback;

  const { data: flashSale } = useQuery({
    queryKey: ["active-flash-sale"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("flash_sales")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 30_000,
  });

  const { data: products } = useQuery({
    queryKey: ["flash-deal-products", content.show_count],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), vendors(store_name)")
        .eq("is_active", true)
        .not("original_price", "is", null)
        .order("created_at", { ascending: false })
        .limit(content.show_count || 4);
      return data || [];
    },
  });

  if (!cms?.is_active || !products?.length) return null;

  return (
    <section className="py-6 lg:py-8">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
          style={{ background: "var(--gradient-warm)" }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-full h-full rounded-full bg-white/5 blur-3xl animate-float" />
            <div className="absolute -bottom-1/2 -right-1/4 w-full h-full rounded-full bg-white/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 px-6 py-6 lg:px-10 lg:py-7">
            {/* Left: Title */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
                  {content.title}
                  <Flame className="h-5 w-5 text-warning animate-pulse" />
                </h2>
                <p className="text-white/60 text-xs mt-0.5">{content.subtitle}</p>
              </div>
            </div>

            {/* Center: Product thumbnails */}
            <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide">
              {products.slice(0, 4).map((p: any) => {
                const img = p.product_images?.find((i: any) => i.is_primary)?.image_url || p.product_images?.[0]?.image_url || "/placeholder.svg";
                const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0;
                return (
                  <Link key={p.id} to={`/product/${p.slug}`} className="relative group shrink-0">
                    <div className="h-16 w-16 lg:h-20 lg:w-20 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-white/50 group-hover:scale-105">
                      <img src={img} alt={p.name} className="h-12 w-12 lg:h-16 lg:w-16 object-contain" />
                    </div>
                    {discount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-md">
                        -{discount}%
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Countdown + CTA */}
            <div className="flex items-center gap-5 shrink-0">
              {flashSale && <Countdown endDate={flashSale.end_date} />}
              <Link to="/search">
                <Button size="sm" className="gap-1.5 bg-white text-foreground hover:bg-white/90 font-semibold rounded-xl shadow-lg px-5">
                  Shop All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StorefrontFlashDeals;
