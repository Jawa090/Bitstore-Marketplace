import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Gavel, Radio, Timer, Filter, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import AuctionCard from "@/components/auction/AuctionCard";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { useEffect } from "react";

type AuctionTab = "live" | "upcoming" | "ended";

const Auctions = () => {
  const [tab, setTab] = useState<AuctionTab>("live");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: auctions, isLoading, refetch } = useQuery({
    queryKey: ["all-auctions", tab],
    queryFn: async () => {
      const now = new Date().toISOString();
      let query = supabase
        .from("auctions")
        .select(`
          *,
          product:products(name, brand, slug, price, product_images(image_url, is_primary))
        `)
        .order("end_time", { ascending: tab === "live" });

      if (tab === "live") {
        query = query.eq("status", "active").gt("end_time", now);
      } else if (tab === "upcoming") {
        query = query.eq("status", "active").gt("start_time", now);
      } else {
        query = query.eq("status", "ended");
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Realtime refresh for live tab
  useEffect(() => {
    if (tab !== "live") return;
    const channel = supabase
      .channel("auctions-page-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "auctions" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tab, refetch]);

  const cards = (auctions || [])
    .filter((a: any) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return a.product?.name?.toLowerCase().includes(q) || a.product?.brand?.toLowerCase().includes(q);
    })
    .map((a: any) => {
      const primaryImg = a.product?.product_images?.find((i: any) => i.is_primary)?.image_url
        || a.product?.product_images?.[0]?.image_url || "/placeholder.svg";
      return {
        id: a.id,
        product: {
          name: a.product?.name || "Unknown",
          brand: a.product?.brand || "",
          slug: a.product?.slug || "",
          image_url: primaryImg,
        },
        starting_price: Number(a.starting_price),
        reserve_price: Number(a.reserve_price),
        buy_now_price: a.buy_now_price ? Number(a.buy_now_price) : null,
        current_bid: Number(a.current_bid),
        bid_count: a.bid_count,
        end_time: a.end_time,
        status: a.status,
        lot_quantity: a.lot_quantity || 1,
        lot_description: a.lot_description,
      };
    });

  const tabs: { key: AuctionTab; label: string; icon: React.ReactNode }[] = [
    { key: "live", label: "Live Now", icon: <Radio className="h-4 w-4" /> },
    { key: "upcoming", label: "Upcoming", icon: <Timer className="h-4 w-4" /> },
    { key: "ended", label: "Ended", icon: <Gavel className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 to-transparent" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-destructive/10 rounded-full px-4 py-1.5 text-sm text-destructive font-medium">
              <Radio className="h-4 w-4 animate-pulse" /> Live Auctions
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Bid on <span className="text-primary">Premium Devices</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Real-time bidding on premium smartphones, tablets, and accessories. Anti-snipe protection ensures fair play.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <div className="container mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <Button
                key={t.key}
                variant={tab === t.key ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setTab(t.key)}
              >
                {t.icon} {t.label}
                {t.key === "live" && cards.length > 0 && tab === "live" && (
                  <Badge className="bg-destructive text-destructive-foreground border-0 ml-1 text-[10px] h-5">
                    {cards.length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container pb-16">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((auction, i) => (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <AuctionCard auction={auction} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Gavel className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No {tab} auctions</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {tab === "live"
                ? "No live auctions right now. Check back soon or browse upcoming ones!"
                : tab === "upcoming"
                  ? "No upcoming auctions scheduled yet."
                  : "No ended auctions to display."}
            </p>
            {tab !== "live" && (
              <Button variant="outline" onClick={() => setTab("live")}>
                View Live Auctions
              </Button>
            )}
          </div>
        )}
      </div>

      <StorefrontFooter />
    </div>
  );
};

export default Auctions;
