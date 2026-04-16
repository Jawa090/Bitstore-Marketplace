import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

const AdminAbandonedCarts = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: carts = [], isLoading } = useQuery({
    queryKey: ["abandoned-carts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .select("*")
        .eq("recovered", false)
        .order("last_activity_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: recoveredCarts = [] } = useQuery({
    queryKey: ["recovered-carts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .select("*")
        .eq("recovered", true)
        .order("last_activity_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const markReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("abandoned_carts").update({ reminder_sent: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abandoned-carts"] });
      toast({ title: "Reminder flagged — WhatsApp integration coming soon" });
    },
  });

  const markRecovered = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("abandoned_carts").update({ recovered: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abandoned-carts"] });
      qc.invalidateQueries({ queryKey: ["recovered-carts"] });
      toast({ title: "Cart marked as recovered" });
    },
  });

  const now = new Date();
  const totalValue = carts.reduce((s: number, c: any) => s + Number(c.total_amount), 0);
  const reminderSent = carts.filter((c: any) => c.reminder_sent).length;

  const getTimeSince = (dateStr: string) => {
    const diff = now.getTime() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "< 1 hour ago";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Abandoned Cart Recovery</h1>
          <p className="text-sm text-muted-foreground">Recover lost revenue with reminders and discount nudges</p>
        </div>
        <Badge variant="outline" className="border-amber-500/30 text-amber-400 gap-1.5">
          <ShoppingCart className="h-3.5 w-3.5" /> {carts.length} Abandoned
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Abandoned Carts</CardTitle>
            <ShoppingCart className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-amber-400">{carts.length}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Lost Revenue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-red-400">AED {totalValue.toLocaleString()}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Reminders Sent</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-primary">{reminderSent}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Recovered</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-emerald-400">{recoveredCarts.length}</p></CardContent>
        </Card>
      </div>

      {/* Cart List */}
      <div className="space-y-2">
        {carts.map((cart: any) => {
          const items = Array.isArray(cart.items) ? cart.items : [];
          return (
            <Card key={cart.id} className="glass border-border/50">
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                <ShoppingCart className="h-5 w-5 shrink-0 text-amber-400" />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium text-sm">
                    {items.length} item{items.length !== 1 ? "s" : ""} · AED {Number(cart.total_amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {items.slice(0, 3).map((i: any) => i.name).join(", ")}
                    {items.length > 3 && ` +${items.length - 3} more`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{getTimeSince(cart.last_activity_at)}</p>
                </div>
                {cart.reminder_sent ? (
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-[10px]">Reminded</Badge>
                ) : (
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => markReminder.mutate(cart.id)}>
                    <RefreshCw className="h-3 w-3" /> Send Reminder
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-xs h-7 gap-1 text-emerald-400" onClick={() => markRecovered.mutate(cart.id)}>
                  <CheckCircle className="h-3 w-3" /> Recovered
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {carts.length === 0 && !isLoading && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No abandoned carts found. Great news — everyone is checking out!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAbandonedCarts;
