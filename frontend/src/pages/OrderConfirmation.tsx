import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getOrderById } from "@/lib/api";
import { motion } from "framer-motion";
import {
  CheckCircle2, Package, Store, Home, Clock, Truck,
  PackageCheck, ShoppingBag, Loader2, MapPin, CreditCard, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import { mockProducts } from "@/data/mockData";

// ── Types ──────────────────────────────────────────────────────────────
interface OrderItemData {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
}

interface SubOrderData {
  id: string;
  vendor_id: string;
  subtotal: string;
  status: string;
  tracking_number: string | null;
  courier: string | null;
  items: OrderItemData[];
}

interface OrderData {
  id: string;
  total_amount: string;
  vat_amount: string;
  cod_fee: string;
  payment_method: string | null;
  payment_status: string | null; // 'paid' | 'pending' | 'failed' — set by backend/webhook
  delivery_emirate: string;
  delivery_address: string;
  delivery_landmark: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  sub_orders: SubOrderData[];
  created_at: string;
}

// ── Status timeline ────────────────────────────────────────────────────
const statusTimeline = [
  { key: "pending", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: PackageCheck },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

// ── Hydrate product name from mockData ─────────────────────────────────
const getProductName = (productId: string) => {
  const product = mockProducts.find((p) => p.id === productId);
  return product?.name || `Product ${productId.slice(0, 8)}`;
};

// ── Component ──────────────────────────────────────────────────────────
const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  // Ref guard — ensures clearCart + sessionStorage cleanup run exactly once
  // even if the order object reference changes due to a re-fetch.
  const clearedRef = useRef(false);

  // Fetch order from backend (source of truth)
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data?.data?.order);
      } catch (err: any) {
        setError(err.displayMessage || "Order not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Clear cart + Stripe session keys once we know payment is confirmed.
  // Priority:
  //  1. DB says payment_status === 'paid'  → confirmed (DB is source of truth)
  //  2. URL redirect_status === 'succeeded' → confirmed (covers webhook-delay window)
  //  3. COD → always confirmed (cart was already cleared in handlePlaceOrder,
  //     but calling clearCart again is harmless and keeps this hook consistent)
  useEffect(() => {
    if (!order || clearedRef.current) return;

    const isCod = order.payment_method === "cod";
    const isPaidInDB = order.payment_status === "paid";
    const isStripeURLSuccess = Boolean(paymentIntent && redirectStatus === "succeeded");

    if (isCod || isPaidInDB || isStripeURLSuccess) {
      clearedRef.current = true;
      clearCart();
      sessionStorage.removeItem("stripeClientSecret");
      sessionStorage.removeItem("stripeOrderId");
    }
  }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16 max-w-2xl flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-muted-foreground">Loading order details…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16 max-w-2xl text-center min-h-[50vh] flex flex-col items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "We couldn't find this order."}</p>
          <Link to="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusIndex = (status: string) => statusTimeline.findIndex((s) => s.key === status);

  // ── Payment-status gate (DB is source of truth) ─────────────────────
  // 1. COD          → always confirmed (payment collected on delivery)
  // 2. payment_status === 'paid' in DB → confirmed (webhook already processed)
  // 3. URL redirect_status === 'succeeded' → confirmed (Stripe just redirected;
  //    webhook may not have hit yet — brief eventual-consistency window)
  // Anything else (card order, not paid in DB, no URL success) → pending/failed
  const isCodOrder = order.payment_method === "cod";
  const isPaidInDB = order.payment_status === "paid";
  const isStripeURLSuccess = Boolean(paymentIntent && redirectStatus === "succeeded");
  const isPaymentConfirmed = isCodOrder || isPaidInDB || isStripeURLSuccess;

  if (!isPaymentConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16 max-w-2xl text-center min-h-[50vh] flex flex-col items-center justify-center gap-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold">Payment Pending or Failed</h1>
          <p className="text-muted-foreground max-w-sm">
            Your order has been recorded but payment was not completed successfully.
            No charge has been made. You can retry payment from your Orders page.
          </p>
          <p className="text-sm text-muted-foreground">
            Order ID: <span className="font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
          </p>
          <div className="flex gap-3 mt-2">
            <Link to="/orders">
              <Button className="h-11 gap-2">
                <Package className="w-4 h-4" /> Go to Orders
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline" className="h-11 gap-2">
                <Home className="w-4 h-4" /> Back to Cart
              </Button>
            </Link>
          </div>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-2xl">
        {/* ── Success Header ──────────────────────────────────────────── */}
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
            Thank you for your purchase! Your order has been placed successfully.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Order ID: <span className="font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString("en-AE", {
              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </motion.div>

        {/* ── Order Summary Card ───────────────────────────────────────── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border p-5 mb-6 bg-card/50 space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Delivery to</span>
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
          {order.payment_method && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Payment</span>
              <span className="font-medium capitalize">{order.payment_method.replace(/_/g, " ")}</span>
            </div>
          )}

          <div className="border-t border-border pt-3 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>AED {(Number(order.total_amount) - Number(order.vat_amount) - Number(order.cod_fee)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>VAT (5%)</span>
              <span>AED {Number(order.vat_amount).toLocaleString()}</span>
            </div>
            {Number(order.cod_fee) > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>COD Fee</span>
                <span>AED {Number(order.cod_fee).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-1">
              <span>Total</span>
              <span className="text-primary">AED {Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Per-Vendor Packages ──────────────────────────────────────── */}
        <div className="space-y-6">
          {order.sub_orders.map((sub, idx) => {
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
                    Package {idx + 1}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    AED {Number(sub.subtotal).toLocaleString()}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {sub.items.map((oi) => (
                    <div key={oi.id} className="flex justify-between text-sm text-muted-foreground">
                      <span className="truncate max-w-[220px]">{getProductName(oi.product_id)} ×{oi.quantity}</span>
                      <span>AED {(Number(oi.unit_price) * oi.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Status Timeline */}
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

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 mt-8"
        >
          <Link to="/orders" className="flex-1">
            <Button variant="outline" className="w-full h-12 gap-2">
              <Package className="w-4 h-4" /> View Order Details
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full h-12 gap-2">
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
