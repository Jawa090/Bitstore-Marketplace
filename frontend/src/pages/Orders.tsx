import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Package, Truck, CheckCircle, XCircle, ArrowLeft,
  ShoppingBag, Calendar, Loader2, Store, MapPin, CreditCard,
  Clock, PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/api/order.service";
import { productService } from "@/services/api/product.service";
import Navbar from "@/components/Navbar";

// ── Types matching backend response ────────────────────────────────────
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
  created_at: string;
}

interface OrderData {
  id: string;
  total_amount: string;
  vat_amount: string;
  cod_fee: string;
  payment_method: string | null;
  delivery_emirate: string;
  delivery_address: string;
  delivery_landmark: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  sub_orders: SubOrderData[];
  created_at: string;
}

// ── Product cache ────────────────────────────────────────────────────────
const productCache = new Map<string, any>();

const fetchProductDetails = async (productId: string) => {
  if (productCache.has(productId)) {
    return productCache.get(productId);
  }
  
  try {
    const product = await productService.getProductById(productId);
    productCache.set(productId, product);
    return product;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────
const getProductName = (productId: string) => {
  const cached = productCache.get(productId);
  return cached?.name || `Product ${productId.slice(0, 8)}`;
};

const getProductImage = (productId: string) => {
  const cached = productCache.get(productId);
  return cached?.images?.[0]?.image_url || "/api/placeholder/80/80";
};

const statusConfig: Record<string, { color: string; icon: typeof Package }> = {
  pending:    { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  confirmed:  { color: "bg-blue-100 text-blue-800 border-blue-200",      icon: PackageCheck },
  processing: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Package },
  shipped:    { color: "bg-sky-100 text-sky-800 border-sky-200",          icon: Truck },
  delivered:  { color: "bg-green-100 text-green-800 border-green-200",    icon: CheckCircle },
  cancelled:  { color: "bg-red-100 text-red-800 border-red-200",          icon: XCircle },
  returned:   { color: "bg-orange-100 text-orange-800 border-orange-200", icon: XCircle },
};

const getStatusMeta = (status: string) =>
  statusConfig[status] || statusConfig.pending;

// ── Component ──────────────────────────────────────────────────────────
const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Return modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnComments, setReturnComments] = useState("");
  const [returnProcessing, setReturnProcessing] = useState(false);

  // ── Fetch orders from API ────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || !user) return;

    const load = async () => {
      try {
        const data = await orderService.getOrders();
        const ordersData = data.orders || [];
        
        // Pre-fetch product details for all order items
        const productIds = new Set<string>();
        ordersData.forEach((order) => {
          order.sub_orders.forEach((sub) => {
            sub.items.forEach((item) => {
              productIds.add(item.product_id);
            });
          });
        });
        
        // Fetch all products in parallel
        await Promise.all(
          Array.from(productIds).map((id) => fetchProductDetails(id))
        );
        
        setOrders(ordersData);
      } catch (err: any) {
        toast({
          title: "Failed to load orders",
          description: err.displayMessage || "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading, toast]);

  // ── Search filter ────────────────────────────────────────────────────
  const filteredOrders = searchQuery.trim()
    ? orders.filter((o) =>
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.delivery_emirate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.sub_orders.some((so) =>
          so.items.some((oi) =>
            getProductName(oi.product_id).toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      )
    : orders;

  // ── Tab filters ──────────────────────────────────────────────────────
  const getByTab = (tab: string) => {
    if (tab === "active")
      return filteredOrders.filter((o) => !["cancelled", "returned"].includes(o.status));
    if (tab === "cancelled")
      return filteredOrders.filter((o) => ["cancelled", "returned"].includes(o.status));
    return filteredOrders;
  };

  // ── Cancel order ─────────────────────────────────────────────────────
  const handleCancel = async (orderId: string) => {
    try {
      const result = await orderService.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? result.order : o))
      );
      toast({ title: "Order cancelled", description: result.message });
    } catch (err: any) {
      toast({
        title: "Cannot cancel",
        description: err.displayMessage || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // ── Return order ─────────────────────────────────────────────────────
  const handleReturn = async () => {
    if (!selectedOrderId || !returnReason) return;
    setReturnProcessing(true);
    try {
      const result = await orderService.returnOrder(selectedOrderId, {
        reason: returnReason,
        comments: returnComments || undefined,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrderId ? { ...o, status: "returned" } : o))
      );
      toast({ title: "Return request submitted", description: result.message });
      setReturnModalOpen(false);
      setReturnReason("");
      setReturnComments("");
      setSelectedOrderId(null);
    } catch (err: any) {
      toast({
        title: "Return failed",
        description: err.displayMessage || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setReturnProcessing(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shopping
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Orders</h1>
          <p className="text-muted-foreground">Track, return, or buy things again</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or product…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled / Returned</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading your orders…</span>
            </div>
          ) : (
            <>
              {["active", "all", "cancelled"].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <OrderList
                    orders={getByTab(tab)}
                    onCancel={handleCancel}
                    onReturn={(orderId) => {
                      setSelectedOrderId(orderId);
                      setReturnModalOpen(true);
                    }}
                  />
                </TabsContent>
              ))}
            </>
          )}
        </Tabs>

        {/* Return Modal */}
        <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Return or Replace Items</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Reason for return
                </label>
                <Select value={returnReason} onValueChange={setReturnReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defective">Item is defective</SelectItem>
                    <SelectItem value="wrong-item">Wrong item received</SelectItem>
                    <SelectItem value="not-as-described">Not as described</SelectItem>
                    <SelectItem value="damaged">Item arrived damaged</SelectItem>
                    <SelectItem value="changed-mind">Changed my mind</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Additional comments (optional)
                </label>
                <Textarea
                  placeholder="Tell us more about the issue…"
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleReturn}
                  disabled={!returnReason || returnProcessing}
                  className="flex-1 gap-2"
                >
                  {returnProcessing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                  ) : (
                    "Submit Return Request"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setReturnModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// ── Order List ─────────────────────────────────────────────────────────
interface OrderListProps {
  orders: OrderData[];
  onCancel: (orderId: string) => void;
  onReturn: (orderId: string) => void;
}

const OrderList = ({ orders, onCancel, onReturn }: OrderListProps) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No orders found</h3>
        <p className="text-muted-foreground mb-6">You haven't placed any orders yet</p>
        <Link to="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const { color: statusColor, icon: StatusIcon } = getStatusMeta(order.status);
        const canCancel = ["pending", "confirmed"].includes(order.status);
        const canReturn = order.status === "delivered";

        return (
          <Card key={order.id} className="border-border overflow-hidden">
            {/* ── Order Header ────────────────────────────────────────── */}
            <CardHeader className="pb-3 bg-secondary/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(order.created_at).toLocaleDateString("en-AE", {
                      year: "numeric", month: "short", day: "numeric",
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{order.delivery_emirate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColor} flex items-center gap-1 border`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <span className="font-bold text-primary">
                    AED {Number(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardHeader>

            {/* ── Sub-order Packages ──────────────────────────────────── */}
            <CardContent className="pt-4 space-y-4">
              {order.sub_orders.map((sub, idx) => {
                const { color: subColor, icon: SubIcon } = getStatusMeta(sub.status);
                return (
                  <div
                    key={sub.id}
                    className="rounded-lg border border-border/60 p-4 bg-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Package {idx + 1}</span>
                      </div>
                      <Badge variant="outline" className={`${subColor} text-xs border`}>
                        <SubIcon className="h-3 w-3 mr-1" />
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Items in this sub-order */}
                    {sub.items.map((oi) => (
                      <div key={oi.id} className="flex gap-3">
                        <img
                          src={getProductImage(oi.product_id)}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg border border-border/50"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {getProductName(oi.product_id)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Qty: {oi.quantity} · AED {Number(oi.unit_price).toLocaleString()} each
                          </p>
                        </div>
                        <span className="text-sm font-semibold whitespace-nowrap">
                          AED {(Number(oi.unit_price) * oi.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}

                    {/* Tracking */}
                    {sub.tracking_number && (
                      <div className="text-xs bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-md px-3 py-2 flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-sky-600" />
                        <span>Tracking: <span className="font-mono">{sub.tracking_number}</span></span>
                        {sub.courier && <span className="text-muted-foreground">via {sub.courier}</span>}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Order-level actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Link to={`/order-confirmation/${order.id}`}>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </Link>
                {canCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => onCancel(order.id)}
                  >
                    Cancel Order
                  </Button>
                )}
                {canReturn && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReturn(order.id)}
                  >
                    Return or Replace
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Orders;