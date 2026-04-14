import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plug, Truck, MessageCircle, CreditCard, Mail, BarChart3, Shield, Globe, Package, Bell } from "lucide-react";

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: "shipping" | "communication" | "payments" | "analytics" | "security";
  status: "available" | "coming_soon" | "beta";
}

const INTEGRATIONS: IntegrationDef[] = [
  { id: "aramex", name: "Aramex Shipping", description: "Auto-generate shipping labels and real-time tracking for UAE & GCC deliveries.", icon: Truck, category: "shipping", status: "available" },
  { id: "quiqup", name: "Quiqup Same-Day", description: "Same-day and next-day delivery within Dubai, Sharjah, and Abu Dhabi.", icon: Package, category: "shipping", status: "available" },
  { id: "whatsapp", name: "WhatsApp Notifications", description: "Send order confirmations, shipping updates, and abandoned cart reminders via WhatsApp Business API.", icon: MessageCircle, category: "communication", status: "available" },
  { id: "email-notifications", name: "Email Notifications", description: "Transactional emails for orders, payouts, and vendor alerts using your branded domain.", icon: Mail, category: "communication", status: "available" },
  { id: "push-notifications", name: "Push Notifications", description: "Browser push notifications for order status changes and flash sale alerts.", icon: Bell, category: "communication", status: "coming_soon" },
  { id: "stripe", name: "Stripe Payments", description: "Accept credit/debit cards, Apple Pay, and Google Pay with automatic split payouts to vendors.", icon: CreditCard, category: "payments", status: "available" },
  { id: "tabby", name: "Tabby (Buy Now Pay Later)", description: "Offer installment payments popular across UAE, KSA, and the wider GCC market.", icon: CreditCard, category: "payments", status: "coming_soon" },
  { id: "google-analytics", name: "Google Analytics 4", description: "Track user behavior, conversion funnels, and revenue attribution across the marketplace.", icon: BarChart3, category: "analytics", status: "available" },
  { id: "meta-pixel", name: "Meta Pixel", description: "Facebook & Instagram conversion tracking for ad campaigns and retargeting audiences.", icon: Globe, category: "analytics", status: "available" },
  { id: "fraud-detection", name: "Fraud Detection", description: "AI-powered order screening to flag suspicious transactions and protect vendors.", icon: Shield, category: "security", status: "beta" },
];

const CATEGORY_LABELS: Record<string, string> = {
  shipping: "Shipping & Logistics",
  communication: "Communication",
  payments: "Payments",
  analytics: "Analytics & Tracking",
  security: "Security",
};

const STATUS_STYLES: Record<string, string> = {
  available: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  coming_soon: "bg-muted text-muted-foreground border-border",
  beta: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  coming_soon: "Coming Soon",
  beta: "Beta",
};

const AdminIntegrations = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: enabledMap = {} } = useQuery({
    queryKey: ["admin-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_integrations")
        .select("id, enabled");
      if (error) throw error;
      const map: Record<string, boolean> = {};
      (data || []).forEach((r: any) => { map[r.id] = r.enabled; });
      return map;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("admin_integrations")
        .upsert({ id, enabled, updated_at: new Date().toISOString(), updated_by: user?.id }, { onConflict: "id" });
      if (error) throw error;
    },
    onMutate: async ({ id, enabled }) => {
      await qc.cancelQueries({ queryKey: ["admin-integrations"] });
      const prev = qc.getQueryData<Record<string, boolean>>(["admin-integrations"]);
      qc.setQueryData(["admin-integrations"], { ...prev, [id]: enabled });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["admin-integrations"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["admin-integrations"] }),
  });

  const enabledCount = INTEGRATIONS.filter((i) => enabledMap[i.id]).length;
  const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Integrations</h1>
          <p className="text-sm text-muted-foreground">
            Connect third-party services to extend your marketplace ·{" "}
            <span className="text-primary font-medium">{enabledCount} active</span>
          </p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary gap-1.5 px-3 py-1">
          <Plug className="h-3.5 w-3.5" /> {INTEGRATIONS.length} Apps
        </Badge>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {CATEGORY_LABELS[cat] || cat}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {INTEGRATIONS.filter((i) => i.category === cat).map((integration) => {
              const enabled = !!enabledMap[integration.id];
              return (
                <Card
                  key={integration.id}
                  className={`glass border-border/50 transition-colors ${enabled ? "border-primary/30 bg-primary/5" : ""}`}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <integration.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{integration.name}</p>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[integration.status]}`}>
                          {STATUS_LABELS[integration.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{integration.description}</p>
                    </div>
                    <div className="shrink-0 pt-1">
                      {integration.status === "available" ? (
                        <Switch
                          checked={enabled}
                          onCheckedChange={(val) => toggleMutation.mutate({ id: integration.id, enabled: val })}
                        />
                      ) : (
                        <Button size="sm" variant="ghost" className="text-xs h-7" disabled>Notify Me</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminIntegrations;
