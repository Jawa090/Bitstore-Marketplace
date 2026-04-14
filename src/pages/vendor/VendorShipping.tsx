import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVendor } from "@/components/vendor/VendorGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Truck, Package, MapPin, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const COURIERS = [
  { value: "aramex", label: "Aramex" },
  { value: "quiqup", label: "Quiqup" },
  { value: "careem", label: "Careem Box" },
  { value: "fetchr", label: "Fetchr" },
  { value: "smsa", label: "SMSA Express" },
  { value: "dhl", label: "DHL Express" },
  { value: "self", label: "Self-Delivery" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    confirmed: "bg-primary/10 text-primary border-primary/20",
    processing: "bg-primary/10 text-primary border-primary/20",
    shipped: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return map[status] ?? "";
};

const VendorShipping = () => {
  const { vendor } = useVendor();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["vendor-shipping-orders", vendor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sub_orders")
        .select(`
          *,
          order:orders(id, customer_id, delivery_emirate, delivery_address, delivery_landmark, phone, notes, created_at),
          items:order_items(*, product:products(name))
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
      const update: Record<string, any> = {};
      if (status) update.status = status;
      if (tracking_number !== undefined) update.tracking_number = tracking_number;
      const { error } = await supabase.from("sub_orders").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-shipping-orders"] });
      toast({ title: "Order updated" });
      setDialogOpen(false);
    },
  });

  const openManage = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setCourier("");
    setTrackingNumber(order.tracking_number ?? "");
    setDeliveryInstructions("");
    setDialogOpen(true);
  };

  const handleGenerateLabel = () => {
    toast({ title: "Shipping Label Generated", description: "UAE shipping label ready (mock). In production this would generate a PDF." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Shipping & Logistics</h1>
        <p className="text-sm text-muted-foreground">Manage deliveries across the UAE</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : !orders?.length ? (
        <Card className="border-border"><CardContent className="py-16 text-center text-muted-foreground">No orders to ship yet.</CardContent></Card>
      ) : (
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Order</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">Destination</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Items</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">Tracking</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((so) => (
                  <TableRow key={so.id} className="border-border">
                    <TableCell>
                      <div>
                        <span className="font-mono text-xs text-foreground">#{so.id.slice(0, 8)}</span>
                        <p className="text-[11px] text-muted-foreground">{new Date(so.created_at).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-foreground">{so.order?.delivery_emirate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {so.items?.length ?? 0} item(s)
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${statusBadge(so.status)}`}>{so.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {so.tracking_number ? (
                        <span className="font-mono text-xs text-foreground">{so.tracking_number}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => openManage(so)}>
                        <Truck className="h-3.5 w-3.5 mr-1" /> Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Manage dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order #{selectedOrder?.id?.slice(0, 8)} — Logistics
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5 pt-2">
              {/* Delivery details */}
              <div className="rounded-lg bg-secondary/50 p-4 space-y-1.5 text-sm">
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {selectedOrder.order?.delivery_emirate}
                </p>
                <p className="text-muted-foreground">{selectedOrder.order?.delivery_address}</p>
                {selectedOrder.order?.delivery_landmark && (
                  <p className="text-muted-foreground">📍 {selectedOrder.order.delivery_landmark}</p>
                )}
                {selectedOrder.order?.phone && <p className="text-muted-foreground">📱 {selectedOrder.order.phone}</p>}
                {selectedOrder.order?.notes && <p className="text-muted-foreground italic">Note: {selectedOrder.order.notes}</p>}
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Items</Label>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.product?.name} ×{item.quantity}</span>
                    <span className="text-foreground font-medium">AED {(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Courier */}
              <div className="space-y-2">
                <Label>Courier</Label>
                <Select value={courier} onValueChange={setCourier}>
                  <SelectTrigger><SelectValue placeholder="Select carrier" /></SelectTrigger>
                  <SelectContent>{COURIERS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Tracking */}
              <div className="space-y-2">
                <Label>Tracking Number / Link</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking ID or URL" className="pl-10" />
                </div>
              </div>

              {/* Delivery instructions */}
              <div className="space-y-2">
                <Label>Delivery Instructions</Label>
                <Textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Villa near Al Khail Gate, call before delivery"
                  rows={2}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleGenerateLabel}>
                  <FileText className="h-3.5 w-3.5" /> Generate UAE Shipping Label
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateOrder.mutate({ id: selectedOrder.id, status: "processing" });
                  }}
                  disabled={selectedOrder.status === "processing" || updateOrder.isPending}
                >
                  Mark as Picked Up
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={() => updateOrder.mutate({
                  id: selectedOrder.id,
                  status: newStatus !== selectedOrder.status ? newStatus : undefined,
                  tracking_number: trackingNumber !== (selectedOrder.tracking_number ?? "") ? trackingNumber : undefined,
                })}
                disabled={updateOrder.isPending}
              >
                {updateOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Update"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorShipping;
