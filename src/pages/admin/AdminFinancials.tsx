import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Receipt, FileSpreadsheet, Store } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const UAE_VAT_RATE = 0.05;

const AdminFinancials = () => {
  const { data } = useQuery({
    queryKey: ["admin-financials"],
    queryFn: async () => {
      const [orders, subOrders, vendors] = await Promise.all([
        supabase.from("orders").select("id, total_amount, status, created_at"),
        supabase.from("sub_orders").select("id, vendor_id, subtotal, shipping_cost, status"),
        supabase.from("vendors").select("id, store_name, commission_rate"),
      ]);

      const orderData = orders.data || [];
      const subOrderData = subOrders.data || [];
      const vendorData = vendors.data || [];

      const gmv = orderData.reduce((s, o) => s + Number(o.total_amount), 0);
      const vatAmount = gmv * UAE_VAT_RATE;
      const revenueExVat = gmv - vatAmount;

      // Per-vendor breakdown
      const vendorMap = Object.fromEntries(vendorData.map((v) => [v.id, v]));
      const vendorBreakdown = vendorData.map((v) => {
        const vendorSubOrders = subOrderData.filter((so) => so.vendor_id === v.id);
        const vendorGmv = vendorSubOrders.reduce((s, so) => s + Number(so.subtotal), 0);
        const commission = vendorGmv * (Number(v.commission_rate) / 100);
        const payout = vendorGmv - commission;
        return {
          name: v.store_name,
          gmv: vendorGmv,
          commission,
          payout,
          rate: Number(v.commission_rate),
          orderCount: vendorSubOrders.length,
        };
      }).filter((v) => v.gmv > 0).sort((a, b) => b.gmv - a.gmv);

      // Total commission
      const totalCommission = vendorBreakdown.reduce((s, v) => s + v.commission, 0);
      const totalPayouts = vendorBreakdown.reduce((s, v) => s + v.payout, 0);

      // Status breakdown
      const delivered = orderData.filter((o) => o.status === "delivered").reduce((s, o) => s + Number(o.total_amount), 0);
      const pending = orderData.filter((o) => ["pending", "confirmed", "processing", "shipped"].includes(o.status)).reduce((s, o) => s + Number(o.total_amount), 0);

      return {
        gmv,
        vatAmount,
        revenueExVat,
        totalCommission,
        totalPayouts,
        fundsHeld: pending,
        readyForPayout: delivered,
        vendorBreakdown,
        totalOrders: orderData.length,
      };
    },
  });

  const fmt = (n: number) => `AED ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const metrics = [
    { label: "Total GMV", value: fmt(data?.gmv ?? 0), icon: DollarSign, sub: `${data?.totalOrders ?? 0} orders` },
    { label: "Commission Earned", value: fmt(data?.totalCommission ?? 0), icon: TrendingUp, sub: "Platform revenue" },
    { label: "UAE VAT (5%)", value: fmt(data?.vatAmount ?? 0), icon: Receipt, sub: `Ex-VAT: ${fmt(data?.revenueExVat ?? 0)}` },
    { label: "Vendor Payouts Due", value: fmt(data?.totalPayouts ?? 0), icon: Store, sub: `Held: ${fmt(data?.fundsHeld ?? 0)}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Financials & Payouts</h1>
          <p className="text-sm text-muted-foreground">Settlement engine & VAT reporting</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FileSpreadsheet className="h-4 w-4" /> Export VAT Report
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{m.label}</CardTitle>
              <m.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settlement Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Settlement Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
              <div>
                <p className="text-sm text-muted-foreground">Funds Held (Pending/Processing)</p>
                <p className="text-xl font-display font-bold">{fmt(data?.fundsHeld ?? 0)}</p>
              </div>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400">Held</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
              <div>
                <p className="text-sm text-muted-foreground">Ready for Payout (Delivered)</p>
                <p className="text-xl font-display font-bold">{fmt(data?.readyForPayout ?? 0)}</p>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">Ready</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Revenue Chart */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Revenue by Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.vendorBreakdown || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 18%)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} width={100} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(222 47% 9%)",
                      border: "1px solid hsl(215 25% 18%)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number, name: string) => [`AED ${v.toLocaleString()}`, name === "commission" ? "Commission" : "Payout"]}
                  />
                  <Bar dataKey="commission" stackId="a" fill="hsl(217 91% 60%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="payout" stackId="a" fill="hsl(200 80% 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Payout Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-sm">Vendor Payout Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs text-muted-foreground">
                  <th className="text-left py-2 px-3">Vendor</th>
                  <th className="text-right py-2 px-3">Orders</th>
                  <th className="text-right py-2 px-3">GMV</th>
                  <th className="text-right py-2 px-3">Rate</th>
                  <th className="text-right py-2 px-3">Commission</th>
                  <th className="text-right py-2 px-3">Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {(data?.vendorBreakdown || []).map((v) => (
                  <tr key={v.name} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{v.name}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{v.orderCount}</td>
                    <td className="py-2.5 px-3 text-right">{fmt(v.gmv)}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{v.rate}%</td>
                    <td className="py-2.5 px-3 text-right text-primary">{fmt(v.commission)}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{fmt(v.payout)}</td>
                  </tr>
                ))}
                {(data?.vendorBreakdown?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">No financial data yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinancials;
