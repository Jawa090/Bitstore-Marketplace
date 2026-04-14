import { Truck, RotateCcw, ShieldCheck, CreditCard } from "lucide-react";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";

interface Badge {
  title: string;
  description: string;
}

interface TrustData {
  badges: Badge[];
}

const fallback: TrustData = {
  badges: [
    { title: "Free Delivery", description: "Across Dubai & Sharjah" },
    { title: "10 Days Return", description: "Hassle-free returns" },
    { title: "12 Mo Warranty", description: "On all devices" },
    { title: "Buy Now, Pay Later", description: "Tabby & Tamara" },
  ],
};

const iconMap: Record<number, typeof Truck> = {
  0: Truck,
  1: RotateCcw,
  2: ShieldCheck,
  3: CreditCard,
};

const StorefrontTrustBar = () => {
  const { data } = useStorefrontContent<TrustData>("trust_badges", fallback);
  if (!data?.is_active) return null;
  const badges = data.content.badges || fallback.badges;

  return (
    <section className="py-2.5 border-b border-border/20 bg-muted/20">
      <div className="container">
        <div className="flex items-center justify-center gap-6 lg:gap-10 overflow-x-auto scrollbar-hide">
          {badges.map((badge, i) => {
            const Icon = iconMap[i] || ShieldCheck;
            return (
              <div key={badge.title} className="flex items-center gap-2 shrink-0">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[11px] text-foreground whitespace-nowrap">{badge.title}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:inline">· {badge.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StorefrontTrustBar;
