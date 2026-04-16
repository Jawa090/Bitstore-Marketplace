import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, CheckCircle2, AlertTriangle, Package, XCircle, Eye, Settings2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminFulfillment = () => {
  const queryClient = useQueryClient();
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookLoaded, setWebhookLoaded] = useState(false);

  // Webhook config
  const { isLoading: loadingWebhook } = useQuery({
    queryKey: ["fulfillment-webhook"],
    queryFn: async () => {
      const { data } = await supabase
        .from("storefront_content")
        .select("content")
        .eq("id", "fulfillment_webhook")
        .maybeSingle();
      const url = (data?.content as any)?.webhook_url || "";
      setWebhookUrl(url);
      setWebhookLoaded(true);
      return url;
    },
  });

  const saveWebhook = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("storefront_content")
        .upsert({
          id: "fulfillment_webhook",
          content: { webhook_url: webhookUrl, description: "External fulfillment API endpoint" },
          is_active: true,
          display_order: 99,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fulfillment-webhook"] });
      toast.success("Webhook URL saved");
    },
    onError: () => toast.error("Failed to save webhook URL"),
  });

  // Notifications
  const { data: notifications, isLoading: loadingNotifs } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  // Fulfillment logs
  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ["fulfillment-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("fulfillment_logs")
        .select("*, vendor:vendors(store_name)")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("is_read", false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const statusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
      case "skipped": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const typeBadge = (type: string) => {
    switch (type) {
      case "out_of_stock":
        return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
      case "fulfillment_error":
        return <Badge variant="outline" className="text-xs border-destructive text-destructive">API Error</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Order Fulfillment</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor fulfillment API calls and review flagged orders.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            Mark all read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Webhook Configuration */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Fulfillment Webhook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="webhook-url">External API Endpoint (Tradeling, Aucnet, etc.)</Label>
              <Input
                id="webhook-url"
                placeholder="https://api.tradeling.com/v1/fulfillment"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <Button
              onClick={() => saveWebhook.mutate()}
              disabled={saveWebhook.isPending}
              className="shrink-0"
            >
              {saveWebhook.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            When a customer completes checkout, order details (SKU, quantity, shipping address) are POST-ed to this URL for each vendor sub-order.
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Admin Notifications
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">{unreadCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingNotifs ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !notifications?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No notifications yet. Fulfillment errors will appear here.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-auto">
              {notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    n.is_read ? "border-border/30 bg-background" : "border-primary/30 bg-primary/5"
                  }`}
                  onClick={() => {
                    setSelectedNotif(n);
                    if (!n.is_read) markRead.mutate(n.id);
                  }}
                >
                  <div className="mt-0.5">
                    {n.type === "out_of_stock" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{n.title}</p>
                      {typeBadge(n.type)}
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => { e.stopPropagation(); setSelectedNotif(n); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fulfillment Logs */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Fulfillment Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !logs?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No fulfillment logs yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Order</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Vendor</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Endpoint</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">HTTP</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Error</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-2 px-3">{statusIcon(log.status)}</td>
                      <td className="py-2 px-3 font-mono text-xs">{log.order_id?.slice(0, 8)}…</td>
                      <td className="py-2 px-3">{(log.vendor as any)?.store_name || "—"}</td>
                      <td className="py-2 px-3 text-xs max-w-[200px] truncate">{log.endpoint_url}</td>
                      <td className="py-2 px-3">
                        {log.response_status ? (
                          <Badge variant={log.response_status < 400 ? "secondary" : "destructive"} className="text-xs">
                            {log.response_status}
                          </Badge>
                        ) : "—"}
                      </td>
                      <td className="py-2 px-3 text-xs text-destructive max-w-[200px] truncate">
                        {log.error_message || "—"}
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotif} onOpenChange={() => setSelectedNotif(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotif?.type === "out_of_stock" ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {selectedNotif?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              {selectedNotif && typeBadge(selectedNotif.type)}
            </div>
            <p className="text-sm">{selectedNotif?.message}</p>
            {selectedNotif?.order_id && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Order ID:</strong> {selectedNotif.order_id}</p>
                {selectedNotif.sub_order_id && (
                  <p><strong>Sub-Order:</strong> {selectedNotif.sub_order_id}</p>
                )}
              </div>
            )}
            {selectedNotif?.metadata && Object.keys(selectedNotif.metadata).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium mb-2">Details</p>
                  <pre className="text-xs bg-secondary rounded-lg p-3 overflow-auto max-h-60">
                    {JSON.stringify(selectedNotif.metadata, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFulfillment;
