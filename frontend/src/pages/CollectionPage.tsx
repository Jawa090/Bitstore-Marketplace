import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";

type SortOption = "newest" | "price-asc" | "price-desc" | "name";

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [conditionFilter, setConditionFilter] = useState<string>("");

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection-page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*, collection_products(display_order, products:product_id(*, product_images(*), vendors(store_name)))")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const products = useMemo(() => {
    if (!collection?.collection_products) return [];
    return (collection.collection_products as any[])
      .sort((a, b) => a.display_order - b.display_order)
      .map((cp) => cp.products)
      .filter(Boolean);
  }, [collection]);

  const brands = useMemo(() => {
    const set = new Set(products.map((p: any) => p.brand));
    return Array.from(set).sort();
  }, [products]);

  const conditions = useMemo(() => {
    const set = new Set(products.map((p: any) => p.condition));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p: any) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    if (brandFilter) {
      result = result.filter((p: any) => p.brand === brandFilter);
    }
    if (conditionFilter) {
      result = result.filter((p: any) => p.condition === conditionFilter);
    }

    switch (sort) {
      case "price-asc":
        result.sort((a: any, b: any) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a: any, b: any) => b.price - a.price);
        break;
      case "name":
        result.sort((a: any, b: any) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, search, sort, brandFilter, conditionFilter]);

  const hasActiveFilters = search || brandFilter || conditionFilter;

  const clearFilters = () => {
    setSearch("");
    setBrandFilter("");
    setConditionFilter("");
  };

  const conditionLabels: Record<string, string> = {
    new: "New",
    used_like_new: "Like New",
    used_good: "Used - Good",
    used_fair: "Used - Fair",
    refurbished: "Refurbished",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{collection?.name || "Collection"}</span>
        </nav>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          </div>
        ) : !collection ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Collection not found</h1>
            <p className="text-muted-foreground mb-6">This collection doesn't exist or has been hidden.</p>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold">{collection.name}</h1>
                {collection.badge_text && (
                  <Badge variant="secondary">{collection.badge_text}</Badge>
                )}
              </div>
              {collection.description && (
                <p className="text-muted-foreground max-w-2xl">{collection.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </p>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-border bg-card/50">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in collection..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              {brands.length > 1 && (
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {conditions.length > 1 && (
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    {conditions.map((c) => (
                      <SelectItem key={c} value={c}>{conditionLabels[c] || c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low → High</SelectItem>
                  <SelectItem value="price-desc">Price: High → Low</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>

            {/* Product Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {filtered.map((p: any, i: number) => {
                  const primaryImage = p.product_images?.find((img: any) => img.is_primary)?.image_url
                    || p.product_images?.[0]?.image_url
                    || "/placeholder.svg";
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    >
                      <ProductCard
                        name={p.name}
                        brand={p.brand}
                        price={p.price}
                        originalPrice={p.original_price || undefined}
                        image={primaryImage}
                        rating={4.5}
                        reviews={0}
                        vendor={(p.vendors as any)?.store_name || "BitStores"}
                        specs={{
                          ram: p.ram || "",
                          storage: p.storage || "",
                          camera: p.camera || "",
                        }}
                        slug={p.slug}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {hasActiveFilters
                    ? "No products match your filters."
                    : "No products in this collection yet."}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <StorefrontFooter />
    </div>
  );
};

export default CollectionPage;
