import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gavel, Users, Flame, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuctionCountdown } from "@/hooks/useAuctionCountdown";

interface AuctionCardProps {
  auction: {
    id: string;
    product: {
      name: string;
      brand: string;
      slug: string;
      image_url?: string;
    };
    starting_price: number;
    reserve_price: number;
    buy_now_price?: number | null;
    current_bid: number;
    bid_count: number;
    end_time: string;
    status: string;
    lot_quantity?: number;
    lot_description?: string | null;
  };
}

const AuctionCard = ({ auction }: AuctionCardProps) => {
  const { display, isUrgent, total } = useAuctionCountdown(auction.end_time);
  const bidProgress = auction.reserve_price > 0
    ? Math.min(100, (auction.current_bid / auction.reserve_price) * 100)
    : 0;

  const isLive = auction.status === "active" && total > 0;
  const lotQty = auction.lot_quantity || 1;
  const perUnit = lotQty > 1 ? auction.current_bid / lotQty : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/auction/${auction.id}`} className="block">
        <div className="rounded-xl border border-border bg-card overflow-hidden group relative">
          {/* Live badge */}
          {isLive && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-500 text-white border-0 gap-1 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-white animate-ping inline-block" />
                LIVE
              </Badge>
            </div>
          )}

          {/* Lot badge */}
          {lotQty > 1 && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-primary text-primary-foreground border-0 gap-1">
                <Package className="h-3 w-3" /> {lotQty} units
              </Badge>
            </div>
          )}

          {/* Image */}
          <div className="aspect-square bg-secondary/30 overflow-hidden relative">
            <img
              src={auction.product.image_url || "/placeholder.svg"}
              alt={auction.product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Countdown overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className={`text-center font-mono text-xl font-bold ${isUrgent ? "text-red-400" : "text-white"}`}>
                {total > 0 ? display : "ENDED"}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">{auction.product.brand}</p>
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight mt-0.5">
                {lotQty > 1 ? `LOT: ${lotQty}x ` : ""}{auction.product.name}
              </h3>
            </div>

            {/* Current bid */}
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current Bid {lotQty > 1 ? "(Total)" : ""}</p>
                <motion.p
                  key={auction.current_bid}
                  initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                  animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                  className="text-lg font-bold"
                >
                  {auction.current_bid.toLocaleString()} AED
                </motion.p>
                {perUnit && (
                  <p className="text-[10px] text-muted-foreground">≈ {perUnit.toFixed(0)} AED/unit</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Users className="h-3 w-3" />
                {auction.bid_count} bids
              </div>
            </div>

            {/* Bid progress toward reserve */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Reserve progress</span>
                <span>{Math.round(bidProgress)}%</span>
              </div>
              <Progress value={bidProgress} className="h-2" />
            </div>

            {/* Buy now badge */}
            {auction.buy_now_price && (
              <div className="flex items-center gap-1 text-xs">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-muted-foreground">Buy Now:</span>
                <span className="font-semibold">{auction.buy_now_price.toLocaleString()} AED</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AuctionCard;
