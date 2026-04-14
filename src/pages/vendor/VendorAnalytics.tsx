import { useQuery } from "@tanstack/react-query";
import { useVendor } from "@/components/vendor/VendorGuard";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Percent, Wallet } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const VendorAnalytics = () => {
  const { vendor } = useVendor();

  const { data } = useQuery({
    queryKey: ["vendor-analytics", vendor?.id],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("sub_orders")
        .select("id, subtotal, status, created_at")
        .eq("vendor_id", vendor!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const totalSales = orders?.reduce((s, o) => s + Number(o.subtotal), 0) ?? 0;
      const commissionRate = vendor?.commission_rate ?? 10;
      const commission = totalSales * (commissionRate / 100);
      const netPayout = totalSales - commission;

      // Group by day for chart
      const dailyMap = new Map<string, number>();
      orders?.forEach((o) => {
        const day = new Date(o.created_at).toLocaleDateString("en", { month: "short", day: "numeric" });
        dailyMap.set(day, (dailyMap.get(day) ?? 0) + Number(o.subtotal));
      });
      const dailySales = Array.from(dailyMap.entries()).map(([day, amount]) => ({ day, amount }));

      // Status breakdown
      const statusMap = new Map<string, number>();
      orders?.forEach((o) => { statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1); });
      const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

      return { totalSales, commission, netPayout, commissionRate, dailySales, statusBreakdown, totalOrders: orders?.length ?? 0 };
    },
    enabled: !!vendor?.id,
  });

  const cards = [
    { label: "Total Sales", value: `AED ${(data?.totalSales ?? 0).toLocaleString()}`, icon: DollarSign, sub: `${data?.totalOrders ?? 0} orders` },
    { label: "Commission", value: `AED ${(data?.commission ?? 0).toLocaleString()}`, icon: Percent, sub: `${data?.commissionRate ?? 10}% rate` },
    { label: "Net Payout", value: `AED ${(data?.netPayout ?? 0).toLocaleString()}`, icon: Wallet, sub: "After commission" },
    { label: "Avg Order", value: `AED ${data?.totalOrders ? Math.round((data.totalSales ?? 0) / data.totalOrders).toLocaleString() : 0}`, icon: TrendingUp, sub: "Per order" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics & Earnings</h1>
        <p className="text-sm text-muted-foreground">Track your store performance and financials</p>
      </div>

      {/* Earnings cards */}
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

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily sales */}
        <Card className="lg:col-span-2 border-border">
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Daily Sales Performance</h3>
            <div className="h-72">
              {data?.dailySales?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 18%)" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(222 47% 9%)", border: "1px solid hsl(215 25% 18%)", borderRadius: 8, color: "hsl(210 40% 98%)", fontSize: 12 }}
                      formatter={(value: number) => [`AED ${value.toLocaleString()}`, "Sales"]}
                    />
                    <Line type="monotone" dataKey="amount" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ fill: "hsl(217 91% 60%)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No sales data yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order status breakdown */}
        <Card className="border-border">
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Order Status</h3>
            <div className="h-72">
              {data?.statusBreakdown?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.statusBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 18%)" />
                    <XAxis type="number" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="status" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(222 47% 9%)", border: "1px solid hsl(215 25% 18%)", borderRadius: 8, color: "hsl(210 40% 98%)", fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission breakdown */}
      <Card className="border-border">
        <CardContent className="p-5">
          <h3 className="font-semibold text-foreground mb-3">Commission Breakdown</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Gross Sales</p>
              <p className="text-lg font-bold text-foreground">AED {(data?.totalSales ?? 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">BitStores Commission ({data?.commissionRate ?? 10}%)</p>
              <p className="text-lg font-bold text-accent">- AED {(data?.commission ?? 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Your Net Payout</p>
              <p className="text-lg font-bold text-primary">AED {(data?.netPayout ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalytics;
