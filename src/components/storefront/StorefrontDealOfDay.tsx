import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { Link } from "react-router-dom";
import { Clock, Flame, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DealData {
  title: string;
  subtitle: string;
  product_id: string;
  end_time: string;
  badge_text: string;
}

const fallback: DealData = {
  title: "Deal of the Day",
  subtitle: "Don't miss this exclusive offer",
  product_id: "",
  end_time: "",
  badge_text: "LIMITED TIME",
};

function useCountdown(endTime: string) {
  const calc = useCallback(() => {
    if (!endTime) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  }, [endTime]);

  const [remaining, setRemaining] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);
  return remaining;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold font-mono text-primary">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

const StorefrontDealOfDay = () => {
  const { data: cms } = useStorefrontContent<DealData>("deal_of_the_day", fallback);
  const content = cms?.content || fallback;

  const { data: product } = useQuery({
    queryKey: ["deal-of-day-product", content.product_id],
    queryFn: async () => {
      if (!content.product_id) {
        // Auto-pick: product with highest discount
        const { data, error } = await supabase
          .from("products")
          .select("*, product_images(*), vendors(store_name)")
          .eq("is_active", true)
          .not("original_price", "is", null)
          .order("created_at", { ascending: false })
          .limit(20);
        if (error || !data || data.length === 0) return null;

        // Find biggest discount
        const best = data.reduce((prev, curr) => {
          const prevDiscount = prev.original_price ? (prev.original_price - prev.price) / prev.original_price : 0;
          const currDiscount = curr.original_price ? (curr.original_price - curr.price) / curr.original_price : 0;
          return currDiscount > prevDiscount ? curr : prev;
        });
        return best;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), vendors(store_name)")
        .eq("id", content.product_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: cms?.is_active !== false,
    staleTime: 120_000,
  });

  const { days, hours, minutes, seconds, expired } = useCountdown(content.end_time);

  if (!cms?.is_active || !product) return null;

  const primaryImage =
    product.product_images?.find((img: any) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url ||
    "/placeholder.svg";

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <section className="py-6 lg:py-10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-primary/20 overflow-hidden"
          style={{ background: "var(--gradient-card)" }}
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left — Product Image */}
            <Link
              to={`/product/${product.slug}`}
              className="relative bg-secondary/30 flex items-center justify-center p-8 lg:p-12 group"
            >
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1">
                  -{discount}% OFF
                </Badge>
              )}
              {content.badge_text && (
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {content.badge_text}
                </Badge>
              )}
              <img
                src={primaryImage}
                alt={product.name}
                className="max-h-64 lg:max-h-80 object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            {/* Right — Details + Countdown */}
            <div className="p-6 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-5 w-5 text-primary" />
                <h2 className="text-xl lg:text-2xl font-bold">{content.title}</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6">{content.subtitle}</p>

              {/* Countdown */}
              {content.end_time && !expired && (
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Ends in
                  </p>
                  <div className="flex gap-3">
                    <CountdownUnit value={days} label="Days" />
                    <div className="flex items-center text-xl font-bold text-muted-foreground/40 -mt-4">:</div>
                    <CountdownUnit value={hours} label="Hours" />
                    <div className="flex items-center text-xl font-bold text-muted-foreground/40 -mt-4">:</div>
                    <CountdownUnit value={minutes} label="Mins" />
                    <div className="flex items-center text-xl font-bold text-muted-foreground/40 -mt-4">:</div>
                    <CountdownUnit value={seconds} label="Secs" />
                  </div>
                </div>
              )}

              {/* Product Info */}
              <Link to={`/product/${product.slug}`} className="group/link">
                <h3 className="text-lg lg:text-xl font-semibold mb-1 group-hover/link:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                {product.brand} · {(product.vendors as any)?.store_name || "BitStores"}
              </p>

              {/* Specs */}
              {(product.ram || product.storage || product.camera) && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {product.ram && (
                    <span className="px-2.5 py-1 text-xs rounded-md bg-secondary border border-border text-muted-foreground">{product.ram} RAM</span>
                  )}
                  {product.storage && (
                    <span className="px-2.5 py-1 text-xs rounded-md bg-secondary border border-border text-muted-foreground">{product.storage}</span>
                  )}
                  {product.camera && (
                    <span className="px-2.5 py-1 text-xs rounded-md bg-secondary border border-border text-muted-foreground">{product.camera}</span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl lg:text-4xl font-bold text-primary">
                  {product.price.toLocaleString()} <span className="text-lg">AED</span>
                </span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.original_price.toLocaleString()} AED
                  </span>
                )}
              </div>

              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to={`/product/${product.slug}`}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  View Deal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StorefrontDealOfDay;
