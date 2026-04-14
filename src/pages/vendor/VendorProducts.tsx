import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVendor } from "@/components/vendor/VendorGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Eye, EyeOff, Edit, Trash2, Loader2, Sparkles, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

/** AI Health Score: mock scoring based on listing completeness */
const getHealthScore = (product: any) => {
  let score = 0;
  const checks = [
    product.name, product.brand, product.description, product.ram, product.storage,
    product.camera, product.battery, product.processor, product.display_size,
    product.images?.length > 0, product.meta_title, product.meta_description,
    product.original_price != null, product.warranty_months != null,
  ];
  checks.forEach((c) => { if (c) score++; });
  return Math.round((score / checks.length) * 100);
};

const healthColor = (score: number) => {
  if (score >= 80) return "text-emerald-500 bg-emerald-500/10";
  if (score >= 50) return "text-yellow-500 bg-yellow-500/10";
  return "text-destructive bg-destructive/10";
};

const VendorProducts = () => {
  const { vendor } = useVendor();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");

  const { data: products, isLoading } = useQuery({
    queryKey: ["vendor-products", vendor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, images:product_images(image_url, is_primary)")
        .eq("vendor_id", vendor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("products").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      toast({ title: "Product updated" });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      toast({ title: "Product deleted" });
    },
  });

  const filtered = (products ?? [])
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price") return Number(b.price) - Number(a.price);
      if (sortBy === "stock") return a.stock_quantity - b.stock_quantity;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Product Catalog</h1>
          <p className="text-sm text-muted-foreground">{products?.length ?? 0} products</p>
        </div>
        <Link to="/vendor/products/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or brand..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {(["name", "price", "stock"] as const).map((s) => (
            <Button key={s} variant={sortBy === s ? "default" : "outline"} size="sm" onClick={() => setSortBy(s)} className="capitalize text-xs">
              {s}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">
              {products?.length === 0 ? "No products yet" : "No results"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {products?.length === 0 ? "Add your first product to start selling." : "Try a different search term."}
            </p>
            {products?.length === 0 && (
              <Link to="/vendor/products/new"><Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Add Product</Button></Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Product</TableHead>
                  <TableHead className="text-muted-foreground hidden sm:table-cell">Price</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">Stock</TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">
                    <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Score</span>
                  </TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => {
                  const primaryImg = product.images?.find((i: any) => i.is_primary)?.image_url || product.images?.[0]?.image_url;
                  const health = getHealthScore(product);
                  return (
                    <TableRow key={product.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                            {primaryImg && <img src={primaryImg} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[180px]">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand} · {product.condition?.replace(/_/g, " ")}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          <span className="text-foreground font-medium">AED {Number(product.price).toLocaleString()}</span>
                          {product.original_price && (
                            <span className="text-xs text-muted-foreground line-through ml-1">
                              {Number(product.original_price).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={product.stock_quantity <= 5 ? "text-accent font-semibold" : "text-foreground"}>
                          {product.stock_quantity}
                        </span>
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <span className="text-xs text-accent ml-1">Low</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${healthColor(health)}`}>
                          {health}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "outline"} className="text-xs">
                          {product.is_active ? "Active" : "Hidden"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/vendor/products/${product.id}/edit`} className="flex items-center gap-2">
                                <Edit className="h-3.5 w-3.5" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleActive.mutate({ id: product.id, is_active: !product.is_active })}
                              className="flex items-center gap-2"
                            >
                              {product.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Hide</> : <><Eye className="h-3.5 w-3.5" /> Show</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => { if (confirm("Delete this product?")) deleteProduct.mutate(product.id); }}
                              className="flex items-center gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VendorProducts;
