import { useQuery } from "@tanstack/react-query";
import { useVendor } from "@/components/vendor/VendorGuard";
import { Package, DollarSign, AlertTriangle, TrendingUp, Clock, Banknote, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock recent sales data
const MOCK_WEEKLY = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    day: d.toLocaleDateString("en", { weekday: "short" }),
    sales: Math.floor(Math.random() * 3000) + 500,
  };
});

const VendorOverview = () => {
  const { vendor } = useVendor();

  const { data: stats } = useQuery({
    queryKey: ["vendor-overview-stats", vendor?.id],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id, price, stock_quantity", { count: "exact" }).eq("vendor_id", vendor!.id),
        supabase.from("sub_orders").select("id, subtotal, status, created_at").eq("vendor_id", vendor!.id),
      ]);
      const totalProducts = products.count ?? 0;
      const lowStock = products.data?.filter((p) => p.stock_quantity <= 5).length ?? 0;
      const totalOrders = orders.data?.length ?? 0;
      const totalRevenue = orders.data?.reduce((s, o) => s + Number(o.subtotal), 0) ?? 0;
      const commission = totalRevenue * ((vendor?.commission_rate ?? 10) / 100);
      const netPayout = totalRevenue - commission;
      const pendingOrders = orders.data?.filter((o) => ["pending", "confirmed"].includes(o.status)).length ?? 0;
      const recentOrders = orders.data
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) ?? [];
      return { totalProducts, lowStock, totalOrders, totalRevenue, commission, netPayout, pendingOrders, recentOrders };
    },
    enabled: !!vendor?.id,
  });

  const { data: recentPayouts = [] } = useQuery({
    queryKey: ["vendor-recent-payouts", vendor?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_payouts")
        .select("*")
        .eq("vendor_id", vendor!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!vendor?.id,
  });

  const totalPaid = recentPayouts.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = recentPayouts.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  const cards = [
    { label: "Total Revenue", value: `AED ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, sub: `Commission: AED ${(stats?.commission ?? 0).toLocaleString()}` },
    { label: "Net Payout", value: `AED ${(stats?.netPayout ?? 0).toLocaleString()}`, icon: TrendingUp, sub: `${vendor?.commission_rate ?? 10}% commission rate` },
    { label: "Active Products", value: stats?.totalProducts ?? 0, icon: Package, sub: stats?.lowStock ? `${stats.lowStock} low stock` : "All stocked" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, icon: AlertTriangle, sub: `${stats?.totalOrders ?? 0} total orders` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Here's what's happening with your store today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</span>
                <card.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales chart + Recent orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Sales This Week</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_WEEKLY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 18%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 47% 9%)",
                      border: "1px solid hsl(215 25% 18%)",
                      borderRadius: 8,
                      color: "hsl(210 40% 98%)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`AED ${value}`, "Sales"]}
                  />
                  <Line type="monotone" dataKey="sales" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ fill: "hsl(217 91% 60%)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Recent Orders</h3>
            {stats?.recentOrders?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentOrders?.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-foreground font-mono text-xs">#{order.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">AED {Number(order.subtotal).toLocaleString()}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payouts Widget */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recent Payouts</h3>
              <Banknote className="h-4 w-4 text-primary" />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1 rounded-lg bg-emerald-500/10 p-3">
                <p className="text-[10px] text-emerald-400 uppercase tracking-wide">Received</p>
                <p className="text-sm font-bold text-emerald-400">AED {totalPaid.toLocaleString()}</p>
              </div>
              <div className="flex-1 rounded-lg bg-amber-500/10 p-3">
                <p className="text-[10px] text-amber-400 uppercase tracking-wide">Pending</p>
                <p className="text-sm font-bold text-amber-400">AED {totalPending.toLocaleString()}</p>
              </div>
            </div>
            {recentPayouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No payouts yet.</p>
            ) : (
              <div className="space-y-2">
                {recentPayouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {p.status === "paid" ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("en-AE", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">AED {Number(p.amount).toLocaleString()}</span>
                      <Badge
                        variant="outline"
                        className={
                          p.status === "paid"
                            ? "text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorOverview;
