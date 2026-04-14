import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Globe, Save, CheckCircle, AlertTriangle } from "lucide-react";

const AdminSEOEditor = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, { meta_title?: string; meta_description?: string }>>({});

  const { data: products = [] } = useQuery({
    queryKey: ["seo-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, brand, meta_title, meta_description")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const entries = Object.entries(edits);
      if (entries.length === 0) return;
      for (const [id, fields] of entries) {
        const { error } = await supabase.from("products").update(fields).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seo-products"] });
      setEdits({});
      toast({ title: `${Object.keys(edits).length} product(s) updated` });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const setEdit = (id: string, field: "meta_title" | "meta_description", value: string) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const getCurrentValue = (product: any, field: "meta_title" | "meta_description") => {
    return edits[product.id]?.[field] ?? product[field] ?? "";
  };

  const filtered = products.filter((p: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.slug.includes(q);
  });

  const missingMeta = products.filter((p: any) => !p.meta_title || !p.meta_description).length;
  const hasMeta = products.length - missingMeta;
  const coverage = products.length > 0 ? Math.round((hasMeta / products.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">SEO Global Editor</h1>
          <p className="text-sm text-muted-foreground">Bulk-edit meta titles & descriptions to dominate "Phones in UAE" searches</p>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={Object.keys(edits).length === 0 || saveMutation.isPending}
          className="gap-1.5"
        >
          <Save className="h-4 w-4" /> Save {Object.keys(edits).length > 0 && `(${Object.keys(edits).length})`}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-display font-bold">{products.length}</p>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-2xl font-display font-bold text-emerald-400">{coverage}%</p>
              <p className="text-xs text-muted-foreground">SEO Coverage</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-2xl font-display font-bold text-amber-400">{missingMeta}</p>
              <p className="text-xs text-muted-foreground">Missing Meta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name, brand, or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Product SEO Cards */}
      <div className="space-y-3">
        {filtered.map((p: any) => {
          const title = getCurrentValue(p, "meta_title");
          const desc = getCurrentValue(p, "meta_description");
          const titleLen = title.length;
          const descLen = desc.length;
          const hasEdits = !!edits[p.id];

          return (
            <Card key={p.id} className={`glass border-border/50 ${hasEdits ? "border-primary/30" : ""}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm flex-1">{p.name}</p>
                  <Badge variant="outline" className="text-[10px]">{p.brand}</Badge>
                  {(!p.meta_title || !p.meta_description) && !hasEdits && (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Missing</Badge>
                  )}
                  {hasEdits && (
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-[10px]">Edited</Badge>
                  )}
                </div>

                {/* Google Preview */}
                <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Google Preview</p>
                  <p className="text-primary text-sm font-medium truncate">{title || p.name + " | BitStores UAE"}</p>
                  <p className="text-emerald-500 text-[11px] truncate">bitstores.com/product/{p.slug}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{desc || "No description set"}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-muted-foreground">Meta Title</label>
                      <span className={`text-[10px] ${titleLen > 60 ? "text-red-400" : titleLen > 50 ? "text-amber-400" : "text-muted-foreground"}`}>
                        {titleLen}/60
                      </span>
                    </div>
                    <Input
                      value={title}
                      onChange={(e) => setEdit(p.id, "meta_title", e.target.value)}
                      placeholder={`${p.name} | BitStores UAE`}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-muted-foreground">Meta Description</label>
                      <span className={`text-[10px] ${descLen > 160 ? "text-red-400" : descLen > 140 ? "text-amber-400" : "text-muted-foreground"}`}>
                        {descLen}/160
                      </span>
                    </div>
                    <Textarea
                      value={desc}
                      onChange={(e) => setEdit(p.id, "meta_description", e.target.value)}
                      placeholder="Buy the best deals on phones in UAE..."
                      className="text-sm min-h-[60px]"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No products found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminSEOEditor;
