import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Store, ArrowRight, Home, Clock, Truck, PackageCheck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";

interface SubOrder {
  id: string;
  vendor_id: string;
  subtotal: number;
  status: string;
  vendors?: { store_name: string } | null;
  order_items?: { id: string; quantity: number; unit_price: number; products?: { name: string; slug: string } | null }[];
}

const statusTimeline = [
  { key: "pending", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmed", label: "Vendor Confirmed", icon: PackageCheck },
  { key: "processing", label: "Being Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    const fetchOrder = async () => {
      const { data: ord } = await supabase.from("orders").select("*").eq("id", id).eq("customer_id", user.id).single();
      if (!ord) { navigate("/"); return; }
      setOrder(ord);

      const { data: subs } = await supabase
        .from("sub_orders")
        .select("*, vendors(store_name), order_items(*, products(name, slug))")
        .eq("order_id", id)
        .order("created_at");
      setSubOrders((subs as any) || []);
      setLoading(false);
    };
    fetchOrder();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16 max-w-2xl space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const statusIndex = (status: string) => statusTimeline.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-2xl">
        {/* Success header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 12 }}
            className="mx-auto w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mb-5"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll keep you updated on the shipping progress.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Order ID: <span className="font-mono text-foreground">{id?.slice(0, 8).toUpperCase()}</span>
          </p>
        </motion.div>

        {/* Order summary */}
        {order && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border p-5 mb-6 bg-card/50 space-y-3"
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery to</span>
              <span className="font-medium">{order.delivery_emirate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium text-right max-w-[220px]">{order.delivery_address}</span>
            </div>
            {order.delivery_landmark && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Landmark</span>
                <span className="font-medium">{order.delivery_landmark}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">AED {Number(order.total_amount).toLocaleString()}</span>
            </div>
          </motion.div>
        )}

        {/* Tracking per vendor */}
        <div className="space-y-6">
          {subOrders.map((sub, idx) => {
            const activeIdx = statusIndex(sub.status);
            return (
              <motion.div
                key={sub.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="rounded-xl border border-border p-5 bg-card/50 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">
                    Package {idx + 1}: {(sub.vendors as any)?.store_name || "Vendor"}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {sub.order_items?.map((oi: any) => (
                    <div key={oi.id} className="flex justify-between text-sm text-muted-foreground">
                      <span className="truncate max-w-[200px]">{oi.products?.name} ×{oi.quantity}</span>
                      <span>AED {(oi.unit_price * oi.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-1 pt-2">
                  {statusTimeline.map((step, i) => {
                    const isActive = i <= activeIdx;
                    const isCurrent = i === activeIdx;
                    return (
                      <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                          } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}>
                            <step.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-[9px] font-medium text-center leading-tight ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {i < statusTimeline.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 rounded ${
                            i < activeIdx ? "bg-primary" : "bg-border"
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 mt-8"
        >
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full h-12 gap-2">
              <Home className="w-4 h-4" /> Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
      <StorefrontFooter />
    </div>
  );
};

export default OrderConfirmation;
