import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logAuditEvent } from "@/lib/audit";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Truck,
  Plus,
  DollarSign,
  CheckCircle,
  Clock,
  Banknote,
  ChevronDown,
  ChevronUp,
  Store,
  X,
} from "lucide-react";

const COURIERS = ["Aramex", "Quiqup", "Fetchr", "SMSA", "J&T Express", "Other"];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  collected: { label: "Collected", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock },
  reconciled: { label: "Reconciled", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle },
  paid_out: { label: "Paid Out", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Banknote },
};

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AdminRemittance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourier, setFilterCourier] = useState("all");

  // Form state
  const [formCourier, setFormCourier] = useState("Aramex");
  const [formRef, setFormRef] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formNotes, setFormNotes] = useState("");

  // Payout form
  const [payoutVendor, setPayoutVendor] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");

  const { data: remittances = [] } = useQuery({
    queryKey: ["admin-remittances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courier_remittances")
        .select("*")
        .order("collection_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ["admin-vendor-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_payouts").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["admin-vendors-list"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("id, store_name").eq("status", "approved");
      return data || [];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-remittances"] });
    qc.invalidateQueries({ queryKey: ["admin-vendor-payouts"] });
  };

  const createRemittance = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("courier_remittances").insert({
        courier_name: formCourier,
        reference_number: formRef || null,
        amount_collected: Number(formAmount),
        collection_date: formDate,
        notes: formNotes || null,
        created_by: user!.id,
      });
      if (error) throw error;
      await logAuditEvent({ action: "create", entityType: "remittance", details: { courier: formCourier, amount: Number(formAmount) } });
    },
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setFormRef(""); setFormAmount(""); setFormNotes("");
      toast({ title: "Remittance recorded" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("courier_remittances").update({ status }).eq("id", id);
      if (error) throw error;
      await logAuditEvent({ action: status, entityType: "remittance", entityId: id, details: { description: `Remittance marked ${status}` } });
    },
    onSuccess: () => { invalidate(); toast({ title: "Status updated" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addPayout = useMutation({
    mutationFn: async ({ remittanceId }: { remittanceId: string }) => {
      const { error } = await supabase.from("vendor_payouts").insert({
        remittance_id: remittanceId,
        vendor_id: payoutVendor,
        amount: Number(payoutAmount),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setPayoutVendor(""); setPayoutAmount("");
      toast({ title: "Payout added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const markPayoutPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vendor_payouts")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      await logAuditEvent({ action: "payout_paid", entityType: "vendor_payout", entityId: id, details: { description: "Payout marked as paid" } });
    },
    onSuccess: () => { invalidate(); toast({ title: "Payout marked as paid" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deletePayout = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendor_payouts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast({ title: "Payout removed" }); },
  });

  const vendorMap = Object.fromEntries(vendors.map((v) => [v.id, v.store_name]));

  // Summary stats
  const totalCollected = remittances.reduce((s, r) => s + Number(r.amount_collected), 0);
  const totalPaidOut = remittances.filter((r) => r.status === "paid_out").reduce((s, r) => s + Number(r.amount_collected), 0);
  const totalPending = totalCollected - totalPaidOut;

  const filtered = remittances.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterCourier !== "all" && r.courier_name !== filterCourier) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Courier Remittance</h1>
          <p className="text-sm text-muted-foreground">Track COD cash collected from couriers and vendor payouts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Record Collection
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Collected</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">AED {fmt(totalCollected)}</p>
            <p className="text-xs text-muted-foreground">{remittances.length} remittances</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Pending Payout</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">AED {fmt(totalPending)}</p>
            <p className="text-xs text-muted-foreground">Awaiting vendor settlement</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Paid Out</CardTitle>
            <Banknote className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">AED {fmt(totalPaidOut)}</p>
            <p className="text-xs text-muted-foreground">Settled to vendors</p>
          </CardContent>
        </Card>
      </div>

      {/* New Collection Form */}
      {showForm && (
        <Card className="glass border-primary/30">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Record New Cash Collection
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={formCourier} onValueChange={setFormCourier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Reference #" value={formRef} onChange={(e) => setFormRef(e.target.value)} />
              <Input type="number" placeholder="Amount (AED)" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <Input placeholder="Notes (optional)" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
            <div className="flex gap-2">
              <Button
                onClick={() => createRemittance.mutate()}
                disabled={!formAmount || Number(formAmount) <= 0 || createRemittance.isPending}
              >
                Save Collection
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterCourier} onValueChange={setFilterCourier}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Courier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Couriers</SelectItem>
            {COURIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="collected">Collected</SelectItem>
            <SelectItem value="reconciled">Reconciled</SelectItem>
            <SelectItem value="paid_out">Paid Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Remittance List */}
      <div className="space-y-3">
        {filtered.map((r) => {
          const isExpanded = expandedId === r.id;
          const rPayouts = payouts.filter((p) => p.remittance_id === r.id);
          const totalAllocated = rPayouts.reduce((s, p) => s + Number(p.amount), 0);
          const unallocated = Number(r.amount_collected) - totalAllocated;
          const sc = statusConfig[r.status] || statusConfig.collected;

          return (
            <Card key={r.id} className="glass border-border/50">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Truck className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{r.courier_name}</span>
                      {r.reference_number && (
                        <span className="text-xs text-muted-foreground">Ref: {r.reference_number}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.collection_date).toLocaleDateString("en-AE", { year: "numeric", month: "short", day: "numeric" })}
                      {r.notes && ` · ${r.notes}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-sm">AED {fmt(Number(r.amount_collected))}</p>
                    {unallocated > 0 && (
                      <p className="text-[10px] text-amber-400">AED {fmt(unallocated)} unallocated</p>
                    )}
                  </div>
                  <Badge variant="outline" className={sc.color}>{sc.label}</Badge>

                  {/* Status actions */}
                  {r.status === "collected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => updateStatus.mutate({ id: r.id, status: "reconciled" })}
                    >
                      Reconcile
                    </Button>
                  )}
                  {r.status === "reconciled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-primary/30 text-primary"
                      onClick={() => updateStatus.mutate({ id: r.id, status: "paid_out" })}
                    >
                      Mark Paid Out
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Expanded: Vendor Payouts */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-4 py-3 space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground">Vendor Payouts</h4>

                    {rPayouts.length > 0 ? (
                      <div className="space-y-1">
                        {rPayouts.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/30">
                            <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-sm flex-1">{vendorMap[p.vendor_id] || "Unknown"}</span>
                            <span className="text-sm font-medium">AED {fmt(Number(p.amount))}</span>
                            <Badge
                              variant="outline"
                              className={
                                p.status === "paid"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
                                  : "bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"
                              }
                            >
                              {p.status}
                            </Badge>
                            {p.status === "pending" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[10px] text-primary"
                                onClick={() => markPayoutPaid.mutate(p.id)}
                              >
                                Mark Paid
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => deletePayout.mutate(p.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">No payouts allocated yet</p>
                    )}

                    {/* Add payout */}
                    <div className="flex gap-2 items-center pt-2 border-t border-border/30">
                      <Select value={payoutVendor} onValueChange={setPayoutVendor}>
                        <SelectTrigger className="flex-1 h-8 text-sm">
                          <SelectValue placeholder="Select vendor..." />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map((v) => (
                            <SelectItem key={v.id} value={v.id}>{v.store_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        className="w-28 h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        className="h-8 gap-1"
                        disabled={!payoutVendor || !payoutAmount || Number(payoutAmount) <= 0}
                        onClick={() => addPayout.mutate({ remittanceId: r.id })}
                      >
                        <Plus className="h-3 w-3" /> Add
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Truck className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No remittance records yet. Click "Record Collection" to start.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminRemittance;
