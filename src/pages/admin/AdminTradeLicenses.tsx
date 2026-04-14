import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, FileCheck, AlertTriangle, Clock, CheckCircle, X, Ban } from "lucide-react";

const AUTHORITIES = ["DED", "ADGM", "DMCC", "DAFZA", "JAFZA", "RAKEZ", "SAIF Zone", "Other"];

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  expiring_soon: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  expired: "bg-red-500/20 text-red-400 border-red-500/30",
  suspended: "bg-red-500/20 text-red-400 border-red-500/30",
};

const AdminTradeLicenses = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const [formVendor, setFormVendor] = useState("");
  const [formLicense, setFormLicense] = useState("");
  const [formAuthority, setFormAuthority] = useState("DED");
  const [formIssueDate, setFormIssueDate] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const { data: licenses = [] } = useQuery({
    queryKey: ["trade-licenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_trade_licenses")
        .select("*, vendors(store_name)")
        .order("expiry_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors-for-licenses"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("id, store_name").eq("status", "approved");
      return data || [];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["trade-licenses"] });

  const addLicense = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vendor_trade_licenses").insert({
        vendor_id: formVendor,
        license_number: formLicense,
        issuing_authority: formAuthority,
        issue_date: formIssueDate,
        expiry_date: formExpiryDate,
        notes: formNotes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setFormVendor(""); setFormLicense(""); setFormIssueDate(""); setFormExpiryDate(""); setFormNotes("");
      toast({ title: "License added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateLicenseStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("vendor_trade_licenses").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const freezeVendor = useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase.from("vendors").update({ status: "suspended" }).eq("id", vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Vendor suspended due to expired license" });
      qc.invalidateQueries({ queryKey: ["vendors-for-licenses"] });
    },
  });

  // Auto-detect expiring/expired
  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 86400000);

  const enriched = licenses.map((l: any) => {
    const expiry = new Date(l.expiry_date);
    let computedStatus = l.status;
    if (l.status === "active" || l.status === "expiring_soon") {
      if (expiry < today) computedStatus = "expired";
      else if (expiry < thirtyDays) computedStatus = "expiring_soon";
    }
    return { ...l, computedStatus };
  });

  const expiredCount = enriched.filter((l: any) => l.computedStatus === "expired").length;
  const expiringCount = enriched.filter((l: any) => l.computedStatus === "expiring_soon").length;
  const activeCount = enriched.filter((l: any) => l.computedStatus === "active").length;

  const filtered = filterStatus === "all" ? enriched : enriched.filter((l: any) => l.computedStatus === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Trade License Vault</h1>
          <p className="text-sm text-muted-foreground">Track UAE trade licenses and auto-freeze vendors on expiry</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add License
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Licenses</CardTitle>
            <FileCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold">{licenses.length}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-emerald-400">{activeCount}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-amber-400">{expiringCount}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-red-400">{expiredCount}</p></CardContent>
        </Card>
      </div>

      {/* Add License Form */}
      {showForm && (
        <Card className="glass border-primary/30">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Register Trade License
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Select value={formVendor} onValueChange={setFormVendor}>
                <SelectTrigger><SelectValue placeholder="Select vendor..." /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.store_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="License Number" value={formLicense} onChange={(e) => setFormLicense(e.target.value)} />
              <Select value={formAuthority} onValueChange={setFormAuthority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUTHORITIES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <div>
                <label className="text-[10px] text-muted-foreground">Issue Date</label>
                <Input type="date" value={formIssueDate} onChange={(e) => setFormIssueDate(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Expiry Date</label>
                <Input type="date" value={formExpiryDate} onChange={(e) => setFormExpiryDate(e.target.value)} />
              </div>
              <Input placeholder="Notes (optional)" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => addLicense.mutate()} disabled={!formVendor || !formLicense || !formIssueDate || !formExpiryDate}>
                Save License
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>

      {/* License List */}
      <div className="space-y-2">
        {filtered.map((l: any) => {
          const daysLeft = Math.ceil((new Date(l.expiry_date).getTime() - today.getTime()) / 86400000);
          return (
            <Card key={l.id} className={`glass border-border/50 ${l.computedStatus === "expired" ? "border-red-500/30" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                <FileCheck className={`h-5 w-5 shrink-0 ${l.computedStatus === "expired" ? "text-red-400" : "text-primary"}`} />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium text-sm">{(l.vendors as any)?.store_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    License: {l.license_number} · {l.issuing_authority}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(l.issue_date).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}
                    {" → "}
                    {new Date(l.expiry_date).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className={`text-[10px] ${daysLeft < 0 ? "text-red-400" : daysLeft < 30 ? "text-amber-400" : "text-muted-foreground"}`}>
                    {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days remaining`}
                  </p>
                </div>
                <Badge variant="outline" className={statusColors[l.computedStatus] || statusColors.active}>
                  {l.computedStatus.replace("_", " ")}
                </Badge>
                {l.computedStatus === "expired" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs h-7 gap-1"
                    onClick={() => {
                      updateLicenseStatus.mutate({ id: l.id, status: "expired" });
                      freezeVendor.mutate(l.vendor_id);
                    }}
                  >
                    <Ban className="h-3 w-3" /> Freeze Vendor
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No trade licenses found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminTradeLicenses;
