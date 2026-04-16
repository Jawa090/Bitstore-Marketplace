import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Store,
  Users,
  ShoppingBag,
  Activity,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
const EMIRATE_COLORS = [
  "hsl(217 91% 60%)",
  "hsl(200 80% 50%)",
  "hsl(142 71% 45%)",
  "hsl(45 93% 47%)",
  "hsl(0 78% 62%)",
  "hsl(280 60% 55%)",
  "hsl(30 80% 55%)",
];

const AdminOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-pulse-stats"],
    queryFn: async () => {
      const [vendors, pendingVendors, orders, profiles, products] = await Promise.all([
        supabase.from("vendors").select("id, commission_rate", { count: "exact" }),
        supabase.from("vendors").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("id, total_amount, delivery_emirate, created_at, status"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);

      const orderData = orders.data || [];
      const vendorData = vendors.data || [];
      const avgCommission = vendorData.length > 0
        ? vendorData.reduce((s, v) => s + Number(v.commission_rate), 0) / vendorData.length
        : 10;

      const gmv = orderData.reduce((s, o) => s + Number(o.total_amount), 0);
      const commission = gmv * (avgCommission / 100);

      // Emirate distribution
      const emirateCounts: Record<string, number> = {};
      orderData.forEach((o) => {
        const e = o.delivery_emirate || "Unknown";
        emirateCounts[e] = (emirateCounts[e] || 0) + 1;
      });
      const emirateData = EMIRATES.map((e, i) => ({
        name: e.length > 8 ? e.slice(0, 3) + "..." : e,
        fullName: e,
        orders: emirateCounts[e] || 0,
        color: EMIRATE_COLORS[i],
      })).filter((e) => e.orders > 0);

      // Daily orders (last 7 days)
      const now = new Date();
      const dailyData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const dayOrders = orderData.filter((o) => o.created_at.startsWith(dateStr));
        return {
          day: d.toLocaleDateString("en", { weekday: "short" }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((s, o) => s + Number(o.total_amount), 0),
        };
      });

      // Recent activity
      const recentOrders = orderData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      return {
        gmv,
        commission,
        totalVendors: vendors.count ?? 0,
        pendingVendors: pendingVendors.count ?? 0,
        totalOrders: orderData.length,
        totalUsers: profiles.count ?? 0,
        totalProducts: products.count ?? 0,
        emirateData,
        dailyData,
        recentOrders,
      };
    },
  });

  const { data: recentVendors = [] } = useQuery({
    queryKey: ["admin-recent-vendors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendors")
        .select("store_name, status, created_at, emirate")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const metricCards = [
    {
      label: "Gross Merchandise Volume",
      value: `AED ${(stats?.gmv ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      accent: "text-primary",
      sub: "Total marketplace sales",
    },
    {
      label: "Commission Earned",
      value: `AED ${(stats?.commission ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      accent: "text-primary",
      sub: "Platform revenue",
    },
    {
      label: "Active Vendors",
      value: stats?.totalVendors ?? 0,
      icon: Store,
      accent: "text-primary",
      sub: `${stats?.pendingVendors ?? 0} pending`,
    },
    {
      label: "Total Customers",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      accent: "text-primary",
      sub: `${stats?.totalProducts ?? 0} live products`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">The Pulse</h1>
          <p className="text-sm text-muted-foreground">Marketplace command center</p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary gap-1.5">
          <Activity className="h-3 w-3" /> Live
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((c) => (
          <Card key={c.label} className="glass border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.accent}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <Card className="glass border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Revenue Trend (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.dailyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 25% 18%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(222 47% 9%)",
                      border: "1px solid hsl(215 25% 18%)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`AED ${v.toLocaleString()}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(217 91% 60%)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(217 91% 60%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Emirate Distribution */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Orders by Emirate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.emirateData?.length ?? 0) > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.emirateData}
                      dataKey="orders"
                      nameKey="fullName"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {stats?.emirateData?.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(222 47% 9%)",
                        border: "1px solid hsl(215 25% 18%)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No order data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed + Orders by Emirate bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity Feed */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Real-time Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentVendors.map((v, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-muted-foreground">New vendor signup:</span>
                <span className="font-medium truncate">{v.store_name}</span>
                <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
                  {v.emirate}
                </Badge>
              </div>
            ))}
            {(stats?.recentOrders || []).map((o, i) => (
              <div key={`o-${i}`} className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ background: "hsl(142 71% 45%)" }} />
                <span className="text-muted-foreground">Order placed:</span>
                <span className="font-medium">AED {Number(o.total_amount).toLocaleString()}</span>
                <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
                  {o.delivery_emirate}
                </Badge>
              </div>
            ))}
            {recentVendors.length === 0 && (stats?.recentOrders?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Daily Orders Bar Chart */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" /> Daily Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.dailyData || []}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(222 47% 9%)",
                      border: "1px solid hsl(215 25% 18%)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
