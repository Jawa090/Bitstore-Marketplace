import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Receipt } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const VAT_RATE = 0.05;
const DEFAULT_COMMISSION_RATE = 0.10;

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  processing: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  shipped: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  refunded: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  // Fetch vendor commission rates via sub_orders
  const { data: subOrders = [] } = useQuery({
    queryKey: ["admin-orders-sub"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sub_orders")
        .select("order_id, vendor_id, subtotal");
      return data || [];
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["admin-vendors-commission"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("id, commission_rate");
      return data || [];
    },
  });

  const vendorRateMap = Object.fromEntries(vendors.map((v) => [v.id, Number(v.commission_rate) / 100]));

  const getBreakdown = (order: Order) => {
    const total = Number(order.total_amount);
    const priceExVat = total / (1 + VAT_RATE);
    const vat = total - priceExVat;

    // Commission from sub_orders linked to this order
    const orderSubs = subOrders.filter((so) => so.order_id === order.id);
    let commission: number;
    if (orderSubs.length > 0) {
      commission = orderSubs.reduce((sum, so) => {
        const rate = vendorRateMap[so.vendor_id] ?? DEFAULT_COMMISSION_RATE;
        return sum + Number(so.subtotal) * rate;
      }, 0);
    } else {
      commission = priceExVat * DEFAULT_COMMISSION_RATE;
    }

    return { total, priceExVat, vat, commission };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">All Orders ({orders.length})</h1>
        <p className="text-sm text-muted-foreground">Price breakdown includes VAT (5%) and platform commission</p>
      </div>

      {orders.length === 0 && !isLoading && (
        <Card className="glass border-border/50">
          <CardContent className="py-8 text-center text-muted-foreground">No orders yet.</CardContent>
        </Card>
      )}

      {/* Header row */}
      {orders.length > 0 && (
        <div className="hidden lg:grid grid-cols-[1fr_100px_100px_100px_100px_100px_90px_100px] gap-3 px-4 py-2 text-xs text-muted-foreground font-medium">
          <span>Order</span>
          <span className="text-right">Total</span>
          <span className="text-right">Price (ex-VAT)</span>
          <span className="text-right">VAT (5%)</span>
          <span className="text-right">Commission</span>
          <span>Status</span>
          <span>Emirate</span>
          <span>Date</span>
        </div>
      )}

      <div className="space-y-2">
        {orders.map((o) => {
          const { total, priceExVat, vat, commission } = getBreakdown(o);
          return (
            <Card key={o.id} className="glass border-border/50">
              <CardContent className="p-4">
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-[1fr_100px_100px_100px_100px_100px_90px_100px] gap-3 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">#{o.id.slice(0, 8)}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{o.delivery_address.slice(0, 30)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-display font-bold text-right">{o.currency} {fmt(total)}</p>
                  <p className="text-sm text-right text-muted-foreground">{o.currency} {fmt(priceExVat)}</p>
                  <p className="text-sm text-right text-muted-foreground">{o.currency} {fmt(vat)}</p>
                  <p className="text-sm text-right text-primary font-medium">{o.currency} {fmt(commission)}</p>
                  <Badge variant="outline" className={`w-fit ${statusColor[o.status] || ""}`}>{o.status}</Badge>
                  <span className="text-xs text-muted-foreground">{o.delivery_emirate}</span>
                  <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                </div>

                {/* Mobile */}
                <div className="lg:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">#{o.id.slice(0, 8)}</span>
                    </div>
                    <Badge variant="outline" className={statusColor[o.status] || ""}>{o.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{o.delivery_emirate} · {o.delivery_address.slice(0, 40)}</p>
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Total</p>
                      <p className="text-sm font-bold">{o.currency} {fmt(total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Price (ex-VAT)</p>
                      <p className="text-sm">{o.currency} {fmt(priceExVat)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">VAT (5%)</p>
                      <p className="text-sm">{o.currency} {fmt(vat)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Commission</p>
                      <p className="text-sm text-primary font-medium">{o.currency} {fmt(commission)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOrders;
