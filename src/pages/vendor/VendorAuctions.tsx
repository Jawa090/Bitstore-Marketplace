import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVendor } from "@/components/vendor/VendorGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Gavel, Loader2, Package } from "lucide-react";
import { useAuctionCountdown } from "@/hooks/useAuctionCountdown";

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

const VendorAuctions = () => {
  const { vendor } = useVendor();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    starting_price: "",
    reserve_price: "",
    buy_now_price: "",
    duration_hours: "24",
    lot_quantity: "1",
    lot_description: "",
  });

  const { data: auctions, isLoading } = useQuery({
    queryKey: ["vendor-auctions", vendor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select("*, product:products(name, slug)")
        .eq("vendor_id", vendor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor,
  });

  const { data: products } = useQuery({
    queryKey: ["vendor-products-for-auction", vendor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock_quantity")
        .eq("vendor_id", vendor!.id)
        .eq("is_active", true)
        .gt("stock_quantity", 0);
      if (error) throw error;
      return data;
    },
    enabled: !!vendor,
  });

  const selectedProduct = products?.find(p => p.id === form.product_id);

  const createAuction = useMutation({
    mutationFn: async () => {
      const lotQty = parseInt(form.lot_quantity) || 1;
      if (lotQty < 1) throw new Error("Lot quantity must be at least 1");
      if (selectedProduct && lotQty > selectedProduct.stock_quantity) {
        throw new Error(`Lot quantity exceeds available stock (${selectedProduct.stock_quantity})`);
      }

      const durationHours = parseInt(form.duration_hours);
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + durationHours * 3600000);

      const { error } = await supabase.from("auctions").insert({
        product_id: form.product_id,
        vendor_id: vendor!.id,
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
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lot auction created!");
      setDialogOpen(false);
      setForm({ product_id: "", starting_price: "", reserve_price: "", buy_now_price: "", duration_hours: "24", lot_quantity: "1", lot_description: "" });
      queryClient.invalidateQueries({ queryKey: ["vendor-auctions"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const statusColor = (s: string) => {
    if (s === "active") return "bg-green-500/10 text-green-500";
    if (s === "ended") return "bg-muted text-muted-foreground";
    return "bg-amber-500/10 text-amber-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gavel className="h-6 w-6" /> Lot Auctions
          </h1>
          <p className="text-muted-foreground text-sm">Create and manage bulk lot auctions for your inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Lot Auction</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Create Lot Auction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Product</Label>
                <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                  <SelectContent>
                    {products?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (stock: {p.stock_quantity})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Lot Quantity (units)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedProduct?.stock_quantity || 9999}
                    value={form.lot_quantity}
                    onChange={(e) => setForm({ ...form, lot_quantity: e.target.value })}
                    placeholder="e.g. 50"
                  />
                  {selectedProduct && (
                    <p className="text-xs text-muted-foreground mt-1">Available: {selectedProduct.stock_quantity} units</p>
                  )}
                </div>
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
              </div>
              <div>
                <Label>Lot Description (optional)</Label>
                <Textarea
                  value={form.lot_description}
                  onChange={(e) => setForm({ ...form, lot_description: e.target.value })}
                  placeholder="e.g. 50x iPhone 15 128GB, mixed colors, Grade A condition..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Starting Price (AED)</Label>
                  <Input type="number" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} placeholder="Total lot price" />
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
              {form.lot_quantity && form.starting_price && parseInt(form.lot_quantity) > 0 && (
                <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                  💡 Per-unit starting: <strong>{(parseFloat(form.starting_price) / parseInt(form.lot_quantity)).toFixed(2)} AED/unit</strong>
                </p>
              )}
              <Button
                className="w-full"
                disabled={!form.product_id || !form.starting_price || !form.reserve_price || !form.lot_quantity || createAuction.isPending}
                onClick={() => createAuction.mutate()}
              >
                {createAuction.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Launch Lot Auction"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Lot Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Bid</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead>Time Left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : auctions?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No auctions yet</TableCell></TableRow>
              ) : auctions?.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.product?.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" /> {a.lot_quantity || 1} units
                    </Badge>
                  </TableCell>
                  <TableCell><Badge className={statusColor(a.status)}>{a.status}</Badge></TableCell>
                  <TableCell className="font-mono">{Number(a.current_bid).toLocaleString()} AED</TableCell>
                  <TableCell>{a.bid_count}</TableCell>
                  <TableCell>
                    {a.status === "active" ? <AuctionTimer endTime={a.end_time} /> : "—"}
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

export default VendorAuctions;
