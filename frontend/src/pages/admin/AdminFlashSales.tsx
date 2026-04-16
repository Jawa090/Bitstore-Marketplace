import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Zap, Plus, Calendar, Tag, Percent, Trash2 } from "lucide-react";

const AdminFlashSales = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [targetValue, setTargetValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: sales = [] } = useQuery({
    queryKey: ["flash-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["product-brands"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("brand").eq("is_active", true);
      return [...new Set((data || []).map((p) => p.brand))].sort();
    },
  });

  const createSale = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("flash_sales").insert({
        name,
        description: description || null,
        discount_type: discountType,
        discount_value: Number(discountValue),
        target_type: targetType,
        target_value: targetType === "all" ? null : targetValue,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flash-sales"] });
      setShowForm(false);
      resetForm();
      toast({ title: "Flash sale created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleSale = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("flash_sales").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flash-sales"] }),
  });

  const deleteSale = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("flash_sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flash-sales"] });
      toast({ title: "Sale deleted" });
    },
  });

  const resetForm = () => {
    setName(""); setDescription(""); setDiscountValue(""); setTargetType("all"); setTargetValue(""); setStartDate(""); setEndDate("");
  };

  const now = new Date();
  const activeSales = sales.filter((s: any) => s.is_active && new Date(s.end_date) > now && new Date(s.start_date) <= now);
  const upcomingSales = sales.filter((s: any) => s.is_active && new Date(s.start_date) > now);
  const pastSales = sales.filter((s: any) => !s.is_active || new Date(s.end_date) <= now);

  const getSaleStatus = (s: any) => {
    if (!s.is_active) return { label: "Disabled", className: "bg-muted text-muted-foreground border-border" };
    const start = new Date(s.start_date);
    const end = new Date(s.end_date);
    if (now < start) return { label: "Scheduled", className: "bg-primary/20 text-primary border-primary/30" };
    if (now > end) return { label: "Ended", className: "bg-muted text-muted-foreground border-border" };
    return { label: "Live", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Flash Sale Manager</h1>
          <p className="text-sm text-muted-foreground">Schedule Ramadan deals, DSF promotions, and category-wide discounts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create Sale
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Live Now</CardTitle>
            <Zap className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-emerald-400">{activeSales.length}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-primary">{upcomingSales.length}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Created</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold">{sales.length}</p></CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="glass border-primary/30">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> New Flash Sale
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input placeholder="Sale Name (e.g., Ramadan Mega Sale)" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
              <div className="flex gap-2">
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">% Off</SelectItem>
                    <SelectItem value="fixed">AED Off</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Value" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
              </div>
              <Select value={targetType} onValueChange={(v) => { setTargetType(v); setTargetValue(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="brand">By Brand</SelectItem>
                  <SelectItem value="category">By Category</SelectItem>
                </SelectContent>
              </Select>
              {targetType === "brand" && (
                <Select value={targetValue} onValueChange={setTargetValue}>
                  <SelectTrigger><SelectValue placeholder="Select brand..." /></SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {targetType === "category" && (
                <Input placeholder="Category keyword" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
              )}
              <div>
                <label className="text-[10px] text-muted-foreground">Start Date</label>
                <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">End Date</label>
                <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createSale.mutate()} disabled={!name || !discountValue || !startDate || !endDate}>
                Launch Sale
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      <div className="space-y-2">
        {sales.map((s: any) => {
          const status = getSaleStatus(s);
          return (
            <Card key={s.id} className="glass border-border/50">
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                <Zap className={`h-5 w-5 shrink-0 ${status.label === "Live" ? "text-emerald-400" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.discount_value}{s.discount_type === "percentage" ? "%" : " AED"} off
                    {s.target_type !== "all" && ` · ${s.target_type}: ${s.target_value}`}
                    {s.target_type === "all" && " · All products"}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{new Date(s.start_date).toLocaleDateString("en-AE", { month: "short", day: "numeric" })} → {new Date(s.end_date).toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <Badge variant="outline" className={status.className}>{status.label}</Badge>
                <Switch
                  checked={s.is_active}
                  onCheckedChange={(val) => toggleSale.mutate({ id: s.id, is_active: val })}
                />
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-400" onClick={() => deleteSale.mutate(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {sales.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No flash sales yet. Create your first promotion!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminFlashSales;
