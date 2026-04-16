import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const conditionLabel: Record<string, string> = {
  new: "New",
  used_like_new: "Like New",
  used_good: "Good",
  used_fair: "Fair",
  refurbished: "Refurbished",
};

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");

  const { data: products = [] } = useQuery({
    queryKey: ["admin-all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, brand, price, currency, condition, stock_quantity, is_active, vendor_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["admin-vendors-map"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("id, store_name");
      return data || [];
    },
  });

  const vendorMap = Object.fromEntries(vendors.map((v) => [v.id, v.store_name]));
  const brands = [...new Set(products.map((p) => p.brand))].sort();

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (brandFilter !== "all" && p.brand !== brandFilter) return false;
    if (conditionFilter !== "all" && p.condition !== conditionFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Global Inventory</h1>
          <p className="text-sm text-muted-foreground">{products.length} products across all vendors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            {Object.entries(conditionLabel).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[1fr_120px_80px_100px_120px_140px_40px] gap-3 px-4 py-2 text-xs text-muted-foreground font-medium">
          <span>Product</span>
          <span>Brand</span>
          <span>Price</span>
          <span>Condition</span>
          <span>Stock</span>
          <span>Vendor</span>
          <span></span>
        </div>
        {filtered.map((p) => (
          <Card key={p.id} className="glass border-border/50">
            <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_120px_80px_100px_120px_140px_40px] gap-3 items-center">
              <div className="flex items-center gap-3 min-w-0">
                <Package className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">{p.name}</span>
                {!p.is_active && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
              </div>
              <span className="text-sm text-muted-foreground">{p.brand}</span>
              <span className="text-sm font-medium">{p.currency} {Number(p.price).toLocaleString()}</span>
              <Badge variant="outline" className="text-[10px] w-fit">{conditionLabel[p.condition] || p.condition}</Badge>
              <span className={`text-sm ${p.stock_quantity < 5 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                {p.stock_quantity} units
              </span>
              <span className="text-xs text-muted-foreground truncate">{vendorMap[p.vendor_id] || "Unknown"}</span>
              <Link to={`/product/${p.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">No products found</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
