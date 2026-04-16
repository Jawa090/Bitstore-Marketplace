import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Gavel, Radio, Shield, Volume2, VolumeX, Flame, CheckCircle, AlertTriangle, Package, Clock, TrendingUp, Users, Crown, Bot, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuctionCountdown } from "@/hooks/useAuctionCountdown";

const GAVEL_SOUND = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bids, setBids] = useState<any[]>([]);
  const [autoBidMax, setAutoBidMax] = useState("");
  const [showAutoBid, setShowAutoBid] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevHighestRef = useRef<string | null>(null);

  // Fetch auction
  const { data: auction, isLoading } = useQuery({
    queryKey: ["auction", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select(`
          *,
          product:products(*, product_images(*), vendor:vendors(store_name, logo_url, emirate))
        `)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch initial bids
  useQuery({
    queryKey: ["auction-bids", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("*, bidder:profiles!bids_bidder_id_fkey(display_name)")
        .eq("auction_id", id!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        // Fallback without join if fkey doesn't exist
        const { data: d2, error: e2 } = await supabase
          .from("bids")
          .select("*")
          .eq("auction_id", id!)
          .order("created_at", { ascending: false })
          .limit(50);
        if (e2) throw e2;
        setBids(d2 || []);
        return d2;
      }
      setBids(data || []);
      return data;
    },
    enabled: !!id,
  });

  // Check user verification
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-auction", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("phone, phone_verified")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ["payment-methods", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_methods")
        .select("id")
        .eq("user_id", user!.id)
        .limit(1);
      return data;
    },
    enabled: !!user,
  });

  const isVerified = userProfile?.phone_verified && (paymentMethods?.length ?? 0) > 0;

  // Fetch user's auto-bid for this auction
  const { data: myAutoBid, refetch: refetchAutoBid } = useQuery({
    queryKey: ["auto-bid", id, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("auto_bids")
        .select("*")
        .eq("auction_id", id!)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!id && !!user,
  });

  // Realtime subscriptions
  useEffect(() => {
    if (!id) return;
    const bidChannel = supabase
      .channel(`bids-${id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bids",
        filter: `auction_id=eq.${id}`,
      }, (payload) => {
        const newBid = payload.new as any;
        setBids((prev) => [newBid, ...prev]);
        
        // Play sound
        if (soundEnabled && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        
        // Outbid notification - create in-app notification
        if (user && prevHighestRef.current && prevHighestRef.current !== newBid.bidder_id) {
          // Notify the previous highest bidder
          supabase.from("user_notifications").insert({
            user_id: prevHighestRef.current,
            type: "outbid",
            title: "You've been outbid! 🔔",
            message: `Someone bid ${Number(newBid.amount).toLocaleString()} AED on an auction you're in.`,
            auction_id: id,
          }).then(() => {});
        }

        if (user && prevHighestRef.current === user.id && newBid.bidder_id !== user.id) {
          toast.error("You've been outbid!", {
            description: `New bid: ${Number(newBid.amount).toLocaleString()} AED`,
            icon: <AlertTriangle className="h-4 w-4" />,
          });

          // Auto-bid: check if we have an active auto-bid
          if (myAutoBid?.is_active && Number(myAutoBid.max_amount) > Number(newBid.amount)) {
            const nextBid = Number(newBid.amount) + 50; // Increment by 50 AED
            const finalBid = Math.min(nextBid, Number(myAutoBid.max_amount));
            if (finalBid > Number(newBid.amount)) {
              setTimeout(() => {
                placeBid.mutate(finalBid);
                toast.info(`🤖 Auto-bid placed: ${finalBid.toLocaleString()} AED`);
              }, 1500);
            }
          }
        }
        prevHighestRef.current = newBid.bidder_id;
      })
      .subscribe();

    const auctionChannel = supabase
      .channel(`auction-${id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "auctions",
        filter: `id=eq.${id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["auction", id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bidChannel);
      supabase.removeChannel(auctionChannel);
    };
  }, [id, soundEnabled, user, queryClient]);

  // Set initial highest bidder
  useEffect(() => {
    if (auction?.highest_bidder_id) {
      prevHighestRef.current = auction.highest_bidder_id;
    }
  }, [auction?.highest_bidder_id]);

  // Place bid mutation
  const placeBid = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error("Login required");
      if (!isVerified) throw new Error("Phone verification and payment method required");

      const { data: currentAuction } = await supabase
        .from("auctions")
        .select("current_bid, end_time, status")
        .eq("id", id!)
        .single();

      if (!currentAuction || currentAuction.status !== "active") {
        throw new Error("Auction is no longer active");
      }
      if (new Date(currentAuction.end_time) <= new Date()) {
        throw new Error("Auction has ended");
      }
      if (amount <= Number(currentAuction.current_bid)) {
        throw new Error("Bid must be higher than current bid");
      }

      // Place the bid
      const { error: bidError } = await supabase.from("bids").insert({
        auction_id: id!,
        bidder_id: user.id,
        amount,
      });
      if (bidError) throw bidError;

      // Update auction
      const endTime = new Date(currentAuction.end_time);
      const now = new Date();
      const secRemaining = (endTime.getTime() - now.getTime()) / 1000;

      const updates: any = {
        current_bid: amount,
        highest_bidder_id: user.id,
        bid_count: (auction?.bid_count || 0) + 1,
      };

      // Anti-snipe: extend by 60s if under 30s remaining
      if (secRemaining <= 30 && secRemaining > 0) {
        updates.end_time = new Date(endTime.getTime() + 60000).toISOString();
        toast.info("⏱️ Anti-snipe: auction extended by 60 seconds!");
      }

      const { error: updateError } = await supabase
        .from("auctions")
        .update(updates)
        .eq("id", id!);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("Bid placed!", { icon: <Gavel className="h-4 w-4" /> });
      queryClient.invalidateQueries({ queryKey: ["auction", id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to place bid");
    },
  });

  // Auto-bid mutations
  const setAutoBid = useMutation({
    mutationFn: async (maxAmount: number) => {
      if (!user) throw new Error("Login required");
      if (!isVerified) throw new Error("Verification required");
      const { data: cur } = await supabase.from("auctions").select("current_bid").eq("id", id!).single();
      if (maxAmount <= Number(cur?.current_bid || 0)) throw new Error("Max bid must exceed current bid");

      const { error } = await supabase
        .from("auto_bids")
        .upsert({
          auction_id: id!,
          user_id: user.id,
          max_amount: maxAmount,
          current_amount: 0,
          is_active: true,
        }, { onConflict: "auction_id,user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("🤖 Auto-bid activated!");
      refetchAutoBid();
      setShowAutoBid(false);
      setAutoBidMax("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const cancelAutoBid = useMutation({
    mutationFn: async () => {
      if (!user || !myAutoBid) return;
      const { error } = await supabase
        .from("auto_bids")
        .update({ is_active: false })
        .eq("id", myAutoBid.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Auto-bid cancelled");
      refetchAutoBid();
    },
  });

  const buyNow = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login required");
      if (!auction?.buy_now_price) throw new Error("No buy now price");

      await supabase.from("auctions").update({
        status: "ended",
        current_bid: Number(auction.buy_now_price),
        highest_bidder_id: user.id,
      }).eq("id", id!);

      // Add to cart
      const product = auction.product as any;
      const primaryImg = product.product_images?.find((i: any) => i.is_primary)?.image_url
        || product.product_images?.[0]?.image_url || "/placeholder.svg";
      addItem({
        productId: product.id,
        name: product.name,
        price: Number(auction.buy_now_price),
        currency: product.currency || "AED",
        imageUrl: primaryImg,
        vendorId: product.vendor_id,
        vendorName: product.vendor?.store_name || "Unknown",
        slug: product.slug,
        stock: 1,
      });
    },
    onSuccess: () => {
      toast.success("🎉 You bought it! Item added to your cart.");
      queryClient.invalidateQueries({ queryKey: ["auction", id] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const countdown = useAuctionCountdown(auction?.end_time || null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-40" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Auction not found</h1>
          <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const product = auction.product as any;
  const images = product?.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
  const primaryImg = images.find((i: any) => i.is_primary)?.image_url || images[0]?.image_url || "/placeholder.svg";
  const currentBid = Number(auction.current_bid);
  const reserveProgress = auction.reserve_price > 0
    ? Math.min(100, (currentBid / Number(auction.reserve_price)) * 100)
    : 0;
  const isActive = auction.status === "active" && countdown.total > 0;
  const isWinner = auction.status === "ended" && auction.highest_bidder_id === user?.id;
  const lotQty = (auction as any).lot_quantity || 1;
  const lotDesc = (auction as any).lot_description;
  const perUnit = lotQty > 1 ? currentBid / lotQty : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <audio ref={audioRef} src={GAVEL_SOUND} preload="auto" />

      <div className="container pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Live Auction</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Product Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="rounded-2xl overflow-hidden bg-secondary/30 relative">
              <img src={primaryImg} alt={product?.name} className="w-full aspect-square object-cover" />
              {isActive && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white border-0 gap-1 text-sm">
                    <Radio className="h-3 w-3 animate-pulse" /> LIVE
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Auction Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">{product?.brand}</p>
              <h1 className="text-2xl lg:text-3xl font-bold">
                {lotQty > 1 ? `LOT: ${lotQty}x ` : ""}{product?.name}
              </h1>
              {lotQty > 1 && (
                <div className="mt-2 space-y-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 text-sm">
                    <Package className="h-4 w-4" /> Bulk Lot — {lotQty} units
                  </Badge>
                  {lotDesc && (
                    <p className="text-sm text-muted-foreground">{lotDesc}</p>
                  )}
                </div>
              )}
            </div>

            {/* Countdown */}
            <div className={`rounded-xl border-2 p-6 text-center ${countdown.isUrgent ? "border-red-500 bg-red-500/5" : "border-border"}`}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {isActive ? "Time Remaining" : "Auction Ended"}
              </p>
              <div className={`font-mono text-4xl font-bold ${countdown.isUrgent ? "text-red-500" : "text-foreground"}`}>
                {countdown.total > 0 ? countdown.display : "00:00:00"}
              </div>
              {countdown.isUrgent && countdown.total > 0 && (
                <p className="text-xs text-red-500 mt-1 animate-pulse">⚡ Ending soon!</p>
              )}
            </div>

            {/* Current Bid */}
            <div className="rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current Bid {lotQty > 1 ? "(Total Lot)" : ""}</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentBid}
                      initial={{ scale: 1.3, color: "hsl(var(--primary))" }}
                      animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                      className="text-3xl font-bold"
                    >
                      {currentBid.toLocaleString()} AED
                    </motion.p>
                  </AnimatePresence>
                  {perUnit && (
                    <p className="text-sm text-muted-foreground">≈ {perUnit.toFixed(0)} AED per unit</p>
                  )}
                </div>
                <Badge variant="secondary">{auction.bid_count} bids</Badge>
              </div>

              {/* Reserve progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Reserve {reserveProgress >= 100 ? "met ✓" : "not met"}</span>
                  <span>{Math.round(reserveProgress)}%</span>
                </div>
                <Progress value={reserveProgress} className="h-2" />
              </div>

              {/* Quick bid buttons */}
              {isActive && user && (
                <div className="space-y-3">
                  {!isVerified && (
                    <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg p-3">
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>Verify your phone number and add a payment method to bid.</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {[50, 100, 500].map((inc) => (
                      <Button
                        key={inc}
                        variant="outline"
                        disabled={!isVerified || placeBid.isPending}
                        onClick={() => placeBid.mutate(currentBid + inc)}
                        className="font-mono"
                      >
                        +{inc} AED
                      </Button>
                    ))}
                  </div>
                  {/* Auto-bid section */}
                  {isVerified && (
                    <div className="border-t border-border pt-3">
                      {myAutoBid?.is_active ? (
                        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-xs font-medium">Auto-Bid Active</p>
                              <p className="text-[10px] text-muted-foreground">Max: {Number(myAutoBid.max_amount).toLocaleString()} AED</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive text-xs"
                            onClick={() => cancelAutoBid.mutate()}
                            disabled={cancelAutoBid.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : showAutoBid ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Set Max Auto-Bid</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            We'll bid incrementally (+50 AED) on your behalf up to your max.
                          </p>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Max amount (AED)"
                              value={autoBidMax}
                              onChange={(e) => setAutoBidMax(e.target.value)}
                              className="text-sm"
                            />
                            <Button
                              size="sm"
                              disabled={!autoBidMax || setAutoBid.isPending}
                              onClick={() => setAutoBid.mutate(Number(autoBidMax))}
                            >
                              <Zap className="h-3 w-3 mr-1" /> Set
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs w-full" onClick={() => setShowAutoBid(false)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 text-xs"
                          onClick={() => setShowAutoBid(true)}
                        >
                          <Bot className="h-3.5 w-3.5" /> Set Up Auto-Bid
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!user && isActive && (
                <Link to="/login">
                  <Button className="w-full">Login to Bid</Button>
                </Link>
              )}

              {/* Buy Now */}
              {isActive && auction.buy_now_price && (
                <Button
                  variant="default"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
                  disabled={!user || buyNow.isPending}
                  onClick={() => buyNow.mutate()}
                >
                  <Flame className="h-4 w-4" />
                  Buy Now — {Number(auction.buy_now_price).toLocaleString()} AED
                </Button>
              )}

              {/* Winner banner */}
              {isWinner && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">🎉 Congratulations! You won this auction!</span>
                </div>
              )}
            </div>

            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {soundEnabled ? "Sound On" : "Sound Off"}
            </Button>
          </motion.div>
        </div>

        {/* Bid History & Details */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {product?.description && (
              <div className="rounded-xl border border-border p-5">
                <h3 className="font-semibold mb-3">About this product</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Bid History Table */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Bid History
                </h3>
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" /> {bids.length} total bids
                </Badge>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background z-10">
                    <tr className="text-xs text-muted-foreground border-b border-border">
                      <th className="text-left py-2 font-medium">#</th>
                      <th className="text-left py-2 font-medium">Bidder</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-right py-2 font-medium hidden sm:table-cell">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {bids.map((bid: any, i: number) => {
                        const isTop = i === 0;
                        const isMe = user && bid.bidder_id === user.id;
                        const bidTime = new Date(bid.created_at);
                        const timeAgo = getTimeAgo(bidTime);
                        return (
                          <motion.tr
                            key={bid.id}
                            initial={{ opacity: 0, backgroundColor: "hsl(var(--primary) / 0.15)" }}
                            animate={{ opacity: 1, backgroundColor: "transparent" }}
                            transition={{ duration: 0.8 }}
                            className={`border-b border-border/30 last:border-0 ${isTop ? "bg-primary/5" : ""}`}
                          >
                            <td className="py-2.5 text-xs text-muted-foreground w-8">
                              {isTop ? <Crown className="h-4 w-4 text-yellow-500" /> : bids.length - i}
                            </td>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${isMe ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                                  {(bid.bidder?.display_name || bid.bidder_id?.slice(0, 4) || "?")[0].toUpperCase()}
                                </div>
                                <div>
                                  <span className={`text-sm ${isMe ? "font-semibold text-primary" : ""}`}>
                                    {isMe ? "You" : (bid.bidder?.display_name || `User••${bid.bidder_id?.slice(-4)}`)}
                                  </span>
                                  {isTop && <span className="text-[10px] text-yellow-500 ml-1.5 font-medium">HIGHEST</span>}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-right">
                              <span className={`font-mono text-sm font-semibold ${isTop ? "text-primary" : ""}`}>
                                {Number(bid.amount).toLocaleString()} AED
                              </span>
                            </td>
                            <td className="py-2.5 text-right hidden sm:table-cell">
                              <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                <Clock className="h-3 w-3" /> {timeAgo}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
                {bids.length === 0 && (
                  <div className="text-center py-10">
                    <Gavel className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No bids yet. Be the first to bid!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Feed + Stats */}
          <div className="space-y-4">
            {/* Live Activity Feed */}
            <div className="rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Radio className="h-4 w-4 text-destructive animate-pulse" /> Live Feed
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                <AnimatePresence>
                  {bids.slice(0, 15).map((bid: any, i: number) => (
                    <motion.div
                      key={bid.id}
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg ${i === 0 ? "bg-primary/10 border border-primary/20" : "border-b border-border/30"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {(bid.bidder?.display_name || bid.bidder_id?.slice(0, 4) || "?")[0].toUpperCase()}
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                          {bid.bidder?.display_name || `User••${bid.bidder_id?.slice(-4)}`}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold">
                        {Number(bid.amount).toLocaleString()} AED
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {bids.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Waiting for bids…</p>
                )}
              </div>
            </div>

            {/* Auction Stats */}
            <div className="rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-semibold text-sm">Auction Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary/30 p-3 text-center">
                  <p className="text-lg font-bold">{auction.bid_count}</p>
                  <p className="text-[10px] text-muted-foreground">Total Bids</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3 text-center">
                  <p className="text-lg font-bold">{new Set(bids.map((b: any) => b.bidder_id)).size}</p>
                  <p className="text-[10px] text-muted-foreground">Unique Bidders</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3 text-center">
                  <p className="text-lg font-bold">{Number(auction.starting_price).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Starting Price</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3 text-center">
                  <p className="text-lg font-bold text-primary">{currentBid.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Current Bid</p>
                </div>
              </div>
              {/* Vendor info */}
              {product?.vendor && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {product.vendor.logo_url ? (
                    <img src={product.vendor.logo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {product.vendor.store_name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{product.vendor.store_name}</p>
                    <p className="text-[10px] text-muted-foreground">{product.vendor.emirate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuctionDetail;
