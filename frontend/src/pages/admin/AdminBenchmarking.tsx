import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingDown, TrendingUp, Minus, BarChart3, Sparkles, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type AIEstimate = {
  noon_estimate: number | null;
  amazon_estimate: number | null;
  market_insight: string;
};

const AdminBenchmarking = () => {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [aiEstimates, setAiEstimates] = useState<Record<string, AIEstimate>>({});
  const [isEstimating, setIsEstimating] = useState(false);
  const [editingPrices, setEditingPrices] = useState<Record<string, { noon?: string; amazon?: string }>>({});
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["benchmark-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, original_price, condition, storage, ram, vendor_id, noon_price, amazon_price, ai_estimated_price, ai_price_updated_at, vendors(store_name)")
        .eq("is_active", true)
        .order("brand")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const savePriceMutation = useMutation({
    mutationFn: async ({ id, noon_price, amazon_price }: { id: string; noon_price: number | null; amazon_price: number | null }) => {
      const { error } = await supabase.from("products").update({ noon_price, amazon_price }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benchmark-products"] });
      toast.success("Competitor price saved");
    },
  });

  const brands = [...new Set(products.map((p: any) => p.brand))].sort();

  // Group products by brand+name similarity
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const groups: Record<string, any[]> = {};
  products.forEach((p: any) => {
    const coreName = p.name.replace(/\d+\s*(gb|tb)/gi, "").replace(/\(.*?\)/g, "").trim();
    const key = `${p.brand}|${normalize(coreName)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  const comparableGroups = Object.entries(groups)
    .filter(([, items]) => items.length >= 2)
    .map(([key, items]) => {
      const prices = items.map((i: any) => Number(i.price));
      const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const spread = max - min;
      return { key, items, avg, min, max, spread, brand: items[0].brand, name: items[0].name };
    })
    .sort((a, b) => b.spread - a.spread);

  const allProductsList = products;

  const singleProducts = Object.entries(groups)
    .filter(([, items]) => items.length === 1)
    .map(([, items]) => items[0]);

  const filtered = comparableGroups.filter((g) => {
    if (brandFilter !== "all" && g.brand !== brandFilter) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalComparable = comparableGroups.length;
  const highSpread = comparableGroups.filter((g) => g.spread > 100).length;

  const runAIEstimate = async () => {
    if (allProductsList.length === 0) return;
    setIsEstimating(true);
    try {
      // Process in batches of 10
      const batchSize = 10;
      const newEstimates: Record<string, AIEstimate> = {};

      for (let i = 0; i < allProductsList.length; i += batchSize) {
        const batch = allProductsList.slice(i, i + batchSize);
        const { data, error } = await supabase.functions.invoke("benchmark-prices", {
          body: {
            products: batch.map((p: any) => ({
              id: p.id,
              name: p.name,
              brand: p.brand,
              storage: p.storage,
              ram: p.ram,
              condition: p.condition,
              price: p.price,
            })),
          },
        });

        if (error) throw error;
        if (data?.estimates) {
          batch.forEach((p: any, idx: number) => {
            if (data.estimates[idx]) {
              newEstimates[p.id] = data.estimates[idx];
            }
          });
        }
      }

      setAiEstimates(newEstimates);

      // Save AI estimates to DB
      for (const [id, est] of Object.entries(newEstimates)) {
        const avgEst = [est.noon_estimate, est.amazon_estimate].filter(Boolean) as number[];
        const aiPrice = avgEst.length > 0 ? avgEst.reduce((a, b) => a + b, 0) / avgEst.length : null;
        await supabase.from("products").update({
          ai_estimated_price: aiPrice,
          ai_price_updated_at: new Date().toISOString(),
        }).eq("id", id);
      }

      queryClient.invalidateQueries({ queryKey: ["benchmark-products"] });
      toast.success(`AI estimates generated for ${Object.keys(newEstimates).length} products`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate AI estimates");
    } finally {
      setIsEstimating(false);
    }
  };

  const getCompetitorComparison = (item: any) => {
    const price = Number(item.price);
    const est = aiEstimates[item.id];
    const noon = item.noon_price ?? est?.noon_estimate ?? null;
    const amazon = item.amazon_price ?? est?.amazon_estimate ?? null;
    return { noon, amazon, insight: est?.market_insight };
  };

  const getPriceDiffBadge = (yourPrice: number, competitorPrice: number | null) => {
    if (!competitorPrice) return null;
    const diff = ((yourPrice - competitorPrice) / competitorPrice) * 100;
    if (diff < -5) return <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px]">{diff.toFixed(0)}% cheaper</Badge>;
    if (diff > 5) return <Badge className="bg-red-500/20 text-red-400 text-[9px]">+{diff.toFixed(0)}% pricier</Badge>;
    return <Badge className="bg-muted text-muted-foreground text-[9px]">~matched</Badge>;
  };

  const handleSavePrice = (id: string) => {
    const edit = editingPrices[id];
    if (!edit) return;
    savePriceMutation.mutate({
      id,
      noon_price: edit.noon ? Number(edit.noon) : null,
      amazon_price: edit.amazon ? Number(edit.amazon) : null,
    });
    setEditingPrices((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Product Benchmarking</h1>
          <p className="text-sm text-muted-foreground">Compare vendor pricing to identify outliers and competitive gaps</p>
        </div>
        <Button
          onClick={runAIEstimate}
          disabled={isEstimating || allProductsList.length === 0}
          className="gap-2"
        >
          {isEstimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isEstimating ? "Estimating…" : "AI Market Estimate"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Comparable Products</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold">{totalComparable}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">High Price Spread (&gt;100 AED)</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold text-amber-400">{highSpread}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Unique (No Competition)</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-display font-bold">{singleProducts.length}</p></CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">AI Estimates</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold text-purple-400">
              {products.filter((p: any) => p.ai_estimated_price || aiEstimates[p.id]).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-3">
        {filtered.map((group) => (
          <Card key={group.key} className={`glass border-border/50 ${group.spread > 100 ? "border-amber-500/30" : ""}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">{group.brand}</Badge>
                <p className="font-medium text-sm flex-1">{group.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Low: <span className="text-emerald-400 font-medium">AED {group.min.toLocaleString()}</span></span>
                  <span>High: <span className="text-red-400 font-medium">AED {group.max.toLocaleString()}</span></span>
                  <span>Spread: <span className={`font-medium ${group.spread > 100 ? "text-amber-400" : "text-muted-foreground"}`}>AED {group.spread.toLocaleString()}</span></span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.items.map((item: any) => {
                  const price = Number(item.price);
                  const diff = price - group.avg;
                  const isLow = price === group.min;
                  const isHigh = price === group.max;
                  const comp = getCompetitorComparison(item);
                  const isEditing = !!editingPrices[item.id];

                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-3 text-xs space-y-2 ${
                        isLow ? "border-emerald-500/30 bg-emerald-500/5" : isHigh ? "border-red-500/30 bg-red-500/5" : "border-border/30 bg-background/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground truncate">{(item.vendors as any)?.store_name || "Unknown"}</span>
                        {isLow && <TrendingDown className="h-3 w-3 text-emerald-400" />}
                        {isHigh && <TrendingUp className="h-3 w-3 text-red-400" />}
                      </div>
                      <p className="font-semibold text-sm">AED {price.toLocaleString()}</p>
                      <p className={`text-[10px] ${diff > 0 ? "text-red-400" : diff < 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(0)} vs avg
                      </p>

                      {/* Competitor Prices */}
                      <div className="border-t border-border/30 pt-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Noon</span>
                          {isEditing ? (
                            <Input
                              className="h-5 w-20 text-[10px] px-1"
                              placeholder="AED"
                              value={editingPrices[item.id]?.noon ?? ""}
                              onChange={(e) => setEditingPrices((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], noon: e.target.value },
                              }))}
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              {comp.noon ? (
                                <>
                                  <span className="font-medium">AED {comp.noon.toLocaleString()}</span>
                                  {getPriceDiffBadge(price, comp.noon)}
                                  {!item.noon_price && <Sparkles className="h-2.5 w-2.5 text-purple-400" />}
                                </>
                              ) : (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Amazon</span>
                          {isEditing ? (
                            <Input
                              className="h-5 w-20 text-[10px] px-1"
                              placeholder="AED"
                              value={editingPrices[item.id]?.amazon ?? ""}
                              onChange={(e) => setEditingPrices((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], amazon: e.target.value },
                              }))}
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              {comp.amazon ? (
                                <>
                                  <span className="font-medium">AED {comp.amazon.toLocaleString()}</span>
                                  {getPriceDiffBadge(price, comp.amazon)}
                                  {!item.amazon_price && <Sparkles className="h-2.5 w-2.5 text-purple-400" />}
                                </>
                              ) : (
                                <span className="text-muted-foreground/50">—</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* AI insight */}
                        {comp.insight && (
                          <p className="text-[9px] text-purple-300/70 italic mt-1">{comp.insight}</p>
                        )}

                        {/* Edit/Save buttons */}
                        <div className="flex justify-end gap-1 mt-1">
                          {isEditing ? (
                            <>
                              <Button variant="ghost" size="sm" className="h-5 text-[10px] px-2" onClick={() => {
                                setEditingPrices((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
                              }}>Cancel</Button>
                              <Button size="sm" className="h-5 text-[10px] px-2 gap-1" onClick={() => handleSavePrice(item.id)}>
                                <Save className="h-2.5 w-2.5" /> Save
                              </Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-2" onClick={() => {
                              setEditingPrices((prev) => ({
                                ...prev,
                                [item.id]: {
                                  noon: item.noon_price?.toString() ?? "",
                                  amazon: item.amazon_price?.toString() ?? "",
                                },
                              }));
                            }}>Edit Prices</Button>
                          )}
                        </div>
                      </div>

                      {item.storage && <span className="text-muted-foreground">{item.storage}</span>}
                      {item.condition !== "new" && <Badge variant="outline" className="text-[9px] ml-1">{item.condition}</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>{comparableGroups.length === 0 ? "Need 2+ vendors selling similar products to benchmark pricing." : "No results match your filters."}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminBenchmarking;
