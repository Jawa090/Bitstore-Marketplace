import { useState, useEffect } from "react";
import { useVendor } from "@/components/vendor/VendorGuard";
import { getVendorOverview, getVendorPayouts } from "@/lib/api";
import { Package, DollarSign, AlertTriangle, TrendingUp, Clock, Banknote, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ── Types ───────────────────────────────────────────────────────────
interface OverviewData {
  total_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

// Mock weekly chart data (will be replaced by analytics API later)
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
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, payoutsRes] = await Promise.all([
          getVendorOverview(),
          getVendorPayouts(),
        ]);
        setOverview(overviewRes.data?.data ?? null);
        setPayouts(payoutsRes.data?.data?.payouts ?? []);
        console.log("Vendor Overview Data:", overviewRes.data?.data);
      } catch (err) {
        console.error("Failed to fetch vendor overview:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const commissionRate = vendor?.commission_rate ?? 10;
  const totalRevenue = overview?.total_revenue ?? 0;
  const commission = totalRevenue * (commissionRate / 100);
  const netPayout = totalRevenue - commission;

  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);
  const recentPayouts = payouts.slice(0, 5);

  const cards = [
    { label: "Total Revenue", value: `AED ${totalRevenue.toLocaleString()}`, icon: DollarSign, sub: `Commission: AED ${commission.toLocaleString()}` },
    { label: "Net Payout", value: `AED ${netPayout.toLocaleString()}`, icon: TrendingUp, sub: `${commissionRate}% commission rate` },
    { label: "Active Products", value: overview?.total_products ?? 0, icon: Package, sub: "Products in catalog" },
    { label: "Pending Orders", value: overview?.pending_orders ?? 0, icon: AlertTriangle, sub: `${overview?.total_orders ?? 0} total orders` },
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

      {/* Sales chart + Recent Payouts */}
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
