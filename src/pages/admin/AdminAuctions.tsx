import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Gavel, XCircle, CheckCircle, Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import { useAuctionCountdown } from "@/hooks/useAuctionCountdown";
import { logAuditEvent } from "@/lib/audit";
import { useAuth } from "@/contexts/AuthContext";

const DURATION_OPTIONS = [
  { label: "1 Hour", hours: 1 },
  { label: "6 Hours", hours: 6 },
  { label: "12 Hours", hours: 12 },
  { label: "24 Hours", hours: 24 },
  { label: "3 Days", hours: 72 },
  { label: "7 Days", hours: 168 },
];

const AuctionTimer = ({ endTime }: { endTime: string }) => {
  const { display, isUrgent } = useAuctionCountdown(endTime);
  return <span className={`font-mono text-sm ${isUrgent ? "text-red-500" : ""}`}>{display}</span>;
};

const emptyForm = {
  product_id: "",
  vendor_id: "",
  starting_price: "",
  reserve_price: "",
  buy_now_price: "",
  duration_hours: "24",
  lot_quantity: "1",
  lot_description: "",
  commission_rate: "5",
};

const AdminAuctions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: auctions, isLoading } = useQuery({
    queryKey: ["admin-auctions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select("*, product:products(name, brand), vendor:vendors(store_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock_quantity, vendor_id")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ["admin-all-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, store_name")
        .eq("status", "approved")
        .order("store_name");
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = form.vendor_id
    ? products?.filter((p) => p.vendor_id === form.vendor_id)
    : products;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setForm({
      product_id: a.product_id,
      vendor_id: a.vendor_id,
      starting_price: String(a.starting_price),
      reserve_price: String(a.reserve_price),
      buy_now_price: a.buy_now_price ? String(a.buy_now_price) : "",
      duration_hours: "24",
      lot_quantity: String(a.lot_quantity || 1),
      lot_description: a.lot_description || "",
      commission_rate: String(a.commission_rate || 5),
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const lotQty = parseInt(form.lot_quantity) || 1;
      if (lotQty < 1) throw new Error("Lot quantity must be at least 1");

      if (editingId) {
        // Update existing auction
        const { error } = await supabase.from("auctions").update({
          product_id: form.product_id,
          vendor_id: form.vendor_id,
          starting_price: parseFloat(form.starting_price),
          reserve_price: parseFloat(form.reserve_price),
          buy_now_price: form.buy_now_price ? parseFloat(form.buy_now_price) : null,
          lot_quantity: lotQty,
          lot_description: form.lot_description || null,
          commission_rate: parseFloat(form.commission_rate) || 5,
        }).eq("id", editingId);
        if (error) throw error;
        if (user) logAuditEvent({ action: "update_auction", entityType: "auction", entityId: editingId });
      } else {
        // Create new auction
        const durationHours = parseInt(form.duration_hours);
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + durationHours * 3600000);

        const { error } = await supabase.from("auctions").insert({
          product_id: form.product_id,
          vendor_id: form.vendor_id,
          starting_price: parseFloat(form.starting_price),
          reserve_price: parseFloat(form.reserve_price),
          buy_now_price: form.buy_now_price ? parseFloat(form.buy_now_price) : null,
          current_bid: parseFloat(form.starting_price),
          status: "active",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          original_end_time: endTime.toISOString(),
          lot_quantity: lotQty,
          lot_description: form.lot_description || null,
          commission_rate: parseFloat(form.commission_rate) || 5,
        });
        if (error) throw error;
        if (user) logAuditEvent({ action: "create_auction", entityType: "auction", entityId: "new" });
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Auction updated!" : "Auction created!");
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-auctions"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteAuction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("auctions").delete().eq("id", id);
      if (error) throw error;
      if (user) logAuditEvent({ action: "delete_auction", entityType: "auction", entityId: id });
    },
    onSuccess: () => {
      toast.success("Auction deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-auctions"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const cancelAuction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("auctions").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
      if (user) logAuditEvent({ action: "cancel_auction", entityType: "auction", entityId: id });
    },
    onSuccess: () => {
      toast.success("Auction cancelled");
      queryClient.invalidateQueries({ queryKey: ["admin-auctions"] });
    },
  });

  const endAuction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("auctions").update({ status: "ended" }).eq("id", id);
      if (error) throw error;
      if (user) logAuditEvent({ action: "end_auction", entityType: "auction", entityId: id });
    },
    onSuccess: () => {
      toast.success("Auction ended");
      queryClient.invalidateQueries({ queryKey: ["admin-auctions"] });
    },
  });

  const stats = {
    active: auctions?.filter((a: any) => a.status === "active").length || 0,
    ended: auctions?.filter((a: any) => a.status === "ended").length || 0,
    total: auctions?.length || 0,
    revenue: auctions
      ?.filter((a: any) => a.status === "ended")
      .reduce((s: number, a: any) => s + Number(a.current_bid) * (Number(a.commission_rate) / 100), 0) || 0,
  };

  const statusColor = (s: string) => {
    if (s === "active") return "bg-green-500/10 text-green-500";
    if (s === "ended") return "bg-muted text-muted-foreground";
    if (s === "cancelled") return "bg-red-500/10 text-red-500";
    return "bg-amber-500/10 text-amber-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Gavel className="h-6 w-6" /> Auction Manager</h1>
          <p className="text-muted-foreground text-sm">Create, edit, and manage all lot auctions</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Auction
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-500">{stats.active}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ended</p><p className="text-2xl font-bold">{stats.ended}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Commission Earned</p><p className="text-2xl font-bold text-primary">{stats.revenue.toLocaleString()} AED</p></CardContent></Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {editingId ? "Edit Auction" : "Create New Lot Auction"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vendor</Label>
                <Select value={form.vendor_id} onValueChange={(v) => setForm({ ...form, vendor_id: v, product_id: "" })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.store_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Product</Label>
                <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {filteredProducts?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.stock_quantity})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Lot Quantity (units)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.lot_quantity}
                  onChange={(e) => setForm({ ...form, lot_quantity: e.target.value })}
                  placeholder="e.g. 50"
                />
              </div>
              {!editingId && (
                <div>
                  <Label>Duration</Label>
                  <Select value={form.duration_hours} onValueChange={(v) => setForm({ ...form, duration_hours: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d.hours} value={String(d.hours)}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {editingId && (
                <div>
                  <Label>Commission %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={form.commission_rate}
                    onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Lot Description (optional)</Label>
              <Textarea
                value={form.lot_description}
                onChange={(e) => setForm({ ...form, lot_description: e.target.value })}
                placeholder="e.g. 50x iPhone 15 128GB, mixed colors, Grade A..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Starting Price (AED)</Label>
                <Input type="number" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} />
              </div>
              <div>
                <Label>Reserve Price (AED)</Label>
                <Input type="number" value={form.reserve_price} onChange={(e) => setForm({ ...form, reserve_price: e.target.value })} />
              </div>
              <div>
                <Label>Buy Now (optional)</Label>
                <Input type="number" value={form.buy_now_price} onChange={(e) => setForm({ ...form, buy_now_price: e.target.value })} />
              </div>
            </div>

            {!editingId && (
              <div>
                <Label>Commission Rate %</Label>
                <Input type="number" min={0} max={50} value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} />
              </div>
            )}

            {form.lot_quantity && form.starting_price && parseInt(form.lot_quantity) > 0 && (
              <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                💡 Per-unit starting: <strong>{(parseFloat(form.starting_price) / parseInt(form.lot_quantity)).toFixed(2)} AED/unit</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!form.product_id || !form.vendor_id || !form.starting_price || !form.reserve_price || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingId ? "Save Changes" : "Launch Auction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Lot Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Bid</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead>Time Left</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : auctions?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No auctions yet. Click "New Auction" to create one.</TableCell></TableRow>
              ) : auctions?.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.product?.name}</TableCell>
                  <TableCell className="text-muted-foreground">{a.vendor?.store_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" /> {a.lot_quantity || 1}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge className={statusColor(a.status)}>{a.status}</Badge></TableCell>
                  <TableCell className="font-mono">{Number(a.current_bid).toLocaleString()} AED</TableCell>
                  <TableCell>{a.bid_count}</TableCell>
                  <TableCell>{a.status === "active" ? <AuctionTimer endTime={a.end_time} /> : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" title="Edit" onClick={() => openEdit(a)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {a.status === "active" && (
                        <>
                          <Button size="sm" variant="ghost" title="End auction" onClick={() => endAuction.mutate(a.id)}>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Cancel auction" onClick={() => cancelAuction.mutate(a.id)}>
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" title="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Auction?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this auction and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteAuction.mutate(a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuctions;
