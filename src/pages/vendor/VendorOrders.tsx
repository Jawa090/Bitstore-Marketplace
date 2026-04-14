import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVendor } from "@/components/vendor/VendorGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, Truck, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  processing: "bg-primary/10 text-primary border-primary/20",
  shipped: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-muted text-muted-foreground border-border",
};

const VendorOrders = () => {
  const { vendor } = useVendor();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: subOrders, isLoading } = useQuery({
    queryKey: ["vendor-orders", vendor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sub_orders")
        .select(`
          *,
          order:orders(id, customer_id, delivery_emirate, delivery_address, delivery_landmark, phone, notes, created_at),
          items:order_items(*, product:products(name, slug))
        `)
        .eq("vendor_id", vendor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, status, tracking_number }: { id: string; status?: string; tracking_number?: string }) => {
      const update: any = {};
      if (status) update.status = status;
      if (tracking_number !== undefined) update.tracking_number = tracking_number;
      const { error } = await supabase.from("sub_orders").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      toast({ title: "Order updated" });
      setSelectedOrder(null);
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Orders</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : !subOrders?.length ? (
        <div className="text-center py-12 text-muted-foreground">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {subOrders.map((so) => (
            <div key={so.id} className="rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-secondary/50 border-b border-border flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Order #{so.id.slice(0, 8)}</span>
                  <Badge className={`text-xs border ${STATUS_COLORS[so.status] ?? ""}`}>
                    {so.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(so.created_at).toLocaleDateString()}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          setSelectedOrder(so);
                          setNewStatus(so.status);
                          setTrackingNumber(so.tracking_number ?? "");
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Manage
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Manage Order #{so.id.slice(0, 8)}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        {/* Delivery info */}
                        <div className="rounded-lg bg-secondary/50 p-3 space-y-1 text-sm">
                          <p className="font-medium text-foreground">Delivery to: {so.order?.delivery_emirate}</p>
                          <p className="text-muted-foreground">{so.order?.delivery_address}</p>
                          {so.order?.delivery_landmark && (
                            <p className="text-muted-foreground">Landmark: {so.order.delivery_landmark}</p>
                          )}
                          {so.order?.phone && <p className="text-muted-foreground">Phone: {so.order.phone}</p>}
                          {so.order?.notes && <p className="text-muted-foreground">Notes: {so.order.notes}</p>}
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                          <Label>Update Status</Label>
                          <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tracking */}
                        <div className="space-y-2">
                          <Label>Tracking Number</Label>
                          <div className="relative">
                            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              placeholder="Enter tracking number"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() =>
                            updateOrder.mutate({
                              id: so.id,
                              status: newStatus !== so.status ? newStatus : undefined,
                              tracking_number: trackingNumber !== (so.tracking_number ?? "") ? trackingNumber : undefined,
                            })
                          }
                          disabled={updateOrder.isPending}
                        >
                          {updateOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-border">
                {so.items?.map((item: any) => (
                  <div key={item.id} className="px-5 py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="text-foreground font-medium">{item.product?.name ?? "Product"}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-foreground font-medium">AED {(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-border flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">AED {Number(so.subtotal).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
