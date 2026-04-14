import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, MapPin, Plus, Warehouse, Phone, Clock, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

const AdminWarehouseLocations = () => {
  const [search, setSearch] = useState("");
  const [emirateFilter, setEmirateFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    vendor_id: "",
    name: "",
    address: "",
    emirate: "Dubai",
    area: "",
    contact_name: "",
    contact_phone: "",
    operating_hours: "",
    notes: "",
    is_active: true,
  });
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["warehouse-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouse_locations")
        .select("*, vendors(store_name)")
        .order("emirate")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors-list"],
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

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editId) {
        const { error } = await supabase.from("warehouse_locations").update(values).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("warehouse_locations").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-locations"] });
      toast.success(editId ? "Location updated" : "Location added");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("warehouse_locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-locations"] });
      toast.success("Location deleted");
    },
  });

  const resetForm = () => {
    setForm({ vendor_id: "", name: "", address: "", emirate: "Dubai", area: "", contact_name: "", contact_phone: "", operating_hours: "", notes: "", is_active: true });
    setEditId(null);
    setDialogOpen(false);
  };

  const openEdit = (loc: any) => {
    setEditId(loc.id);
    setForm({
      vendor_id: loc.vendor_id,
      name: loc.name,
      address: loc.address,
      emirate: loc.emirate,
      area: loc.area || "",
      contact_name: loc.contact_name || "",
      contact_phone: loc.contact_phone || "",
      operating_hours: loc.operating_hours || "",
      notes: loc.notes || "",
      is_active: loc.is_active,
    });
    setDialogOpen(true);
  };

  const filtered = locations.filter((l: any) => {
    if (emirateFilter !== "all" && l.emirate !== emirateFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return l.name.toLowerCase().includes(s) || l.address.toLowerCase().includes(s) || (l.area || "").toLowerCase().includes(s) || (l.vendors as any)?.store_name?.toLowerCase().includes(s);
    }
    return true;
  });

  const activeCount = locations.filter((l: any) => l.is_active).length;
  const emirateCounts = EMIRATES.map((e) => ({
    name: e,
    count: locations.filter((l: any) => l.emirate === e).length,
  })).filter((e) => e.count > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Warehouse & Pickup Locations</h1>
          <p className="text-sm text-muted-foreground">Manage courier pickup points across the UAE</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Location</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit Location" : "Add Pickup Location"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Vendor</Label>
                <Select value={form.vendor_id} onValueChange={(v) => setForm({ ...form, vendor_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.store_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location Name</Label>
                <Input placeholder="e.g. Al Quoz Warehouse" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Emirate</Label>
                  <Select value={form.emirate} onValueChange={(v) => setForm({ ...form, emirate: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EMIRATES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Area</Label>
                  <Input placeholder="e.g. Al Quoz Industrial" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Full Address</Label>
                <Textarea placeholder="Street, building, floor..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Name</Label>
                  <Input placeholder="Point of contact" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input placeholder="+971 50 xxx xxxx" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Operating Hours</Label>
                <Input placeholder="e.g. Sun-Thu 9AM-6PM" value={form.operating_hours} onChange={(e) => setForm({ ...form, operating_hours: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Special instructions for couriers..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
                <Label>Active</Label>
              </div>
              <Button
                className="w-full"
                onClick={() => saveMutation.mutate(form)}
                disabled={!form.vendor_id || !form.name || !form.address || saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : editId ? "Update Location" : "Add Location"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Locations</CardTitle>
            <Warehouse className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold">{locations.length}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Active</CardTitle>
            <MapPin className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-emerald-400">{activeCount}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Emirates Covered</CardTitle>
            <MapPin className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold text-blue-400">{emirateCounts.length}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {emirateCounts.map((e) => (
                <Badge key={e.name} variant="outline" className="text-[9px]">{e.name} ({e.count})</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={emirateFilter} onValueChange={setEmirateFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Emirates</SelectItem>
            {EMIRATES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isLoading ? (
          <Card className="glass border-border/50 col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">Loading locations...</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="glass border-border/50 col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Warehouse className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No pickup locations yet. Add your first one above.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((loc: any) => (
            <Card key={loc.id} className={`glass border-border/50 ${!loc.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{loc.name}</p>
                      {!loc.is_active && <Badge variant="outline" className="text-[9px]">Inactive</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{(loc.vendors as any)?.store_name}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(loc)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteMutation.mutate(loc.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{loc.address}{loc.area ? `, ${loc.area}` : ""}, {loc.emirate}</span>
                </div>
                {loc.contact_phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{loc.contact_name ? `${loc.contact_name} — ` : ""}{loc.contact_phone}</span>
                  </div>
                )}
                {loc.operating_hours && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{loc.operating_hours}</span>
                  </div>
                )}
                {loc.notes && (
                  <p className="text-[10px] text-muted-foreground/70 italic border-t border-border/30 pt-1">{loc.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminWarehouseLocations;
