import { Link } from "react-router-dom";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { Zap, Gift, Truck } from "lucide-react";

interface AnnouncementData {
  text: string;
  link: string;
  bg_color: string;
}

const fallback: AnnouncementData = {
  text: "FREE DELIVERY on orders over 500 AED! Shop Now",
  link: "/search",
  bg_color: "primary",
};

const promos = [
  { icon: Zap, text: "⚡ Flash Sale — Up to 70% OFF on Renewed Devices" },
  { icon: Gift, text: "🎁 Use code BITSTORES10 for 10% OFF your first order" },
  { icon: Truck, text: "🚚 FREE Same-Day Delivery across Dubai & Sharjah" },
];

const AnnouncementBar = () => {
  const { data } = useStorefrontContent<AnnouncementData>("announcement_bar", fallback);
  if (!data?.is_active) return null;
  const content = data.content;

  return (
    <div className="relative overflow-hidden bg-foreground">
      <div className="py-2">
        <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
          {[...promos, ...promos].map((p, i) => (
            <Link
              key={i}
              to={content.link || "/search"}
              className="flex items-center gap-2 text-background text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity shrink-0"
            >
              <p.icon className="h-3.5 w-3.5" />
              <span>{i < promos.length ? content.text : p.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
