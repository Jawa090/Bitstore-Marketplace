import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, Grid3X3, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { productService, type Product } from "@/services/api/product.service";
import { categoryService } from "@/services/api/category.service";
import { brandService } from "@/services/api/brand.service";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest First" },
];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialBrand = searchParams.get("brand") || "";
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    category: initialCategory,
    brand: initialBrand,
  });
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  // Fetch products from backend
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', searchTerm, filterValues, sortBy],
    queryFn: () => productService.getProducts({
      search: searchTerm || undefined,
      category_id: filterValues.category || undefined,
      brand_id: filterValues.brand || undefined,
      condition: filterValues.condition || undefined,
      min_price: filterValues.priceRange?.[0] || undefined,
      max_price: filterValues.priceRange?.[1] || undefined,
      sort_by: sortBy === "price_asc" ? "price" : sortBy === "price_desc" ? "price" : sortBy === "newest" ? "created_at" : "created_at",
      sort_order: sortBy === "price_asc" ? "asc" : "desc",
      limit: 50,
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch categories for filters
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch brands for filters
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: brandService.getBrands,
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.products || [];

  // Create filter configs from backend data
  const filterConfigs = [
    {
      id: "category",
      label: "Category",
      filter_type: "checkbox",
      options: categories.filter(c => c.is_active).map(c => ({ value: c.id, label: c.name })),
    },
    {
      id: "brand", 
      label: "Brand",
      filter_type: "checkbox",
      options: brands.filter(b => b.is_active).map(b => ({ value: b.id, label: b.name })),
    },
    {
      id: "condition",
      label: "Condition",
      filter_type: "checkbox", 
      options: [
        { value: "new", label: "New" },
        { value: "used_like_new", label: "Like New" },
        { value: "used_good", label: "Used - Good" },
        { value: "used_fair", label: "Used - Fair" },
        { value: "refurbished", label: "Refurbished" },
      ],
    },
    {
      id: "priceRange",
      label: "Price Range",
      filter_type: "range",
      config: { min: 0, max: 20000, step: 100 },
    },
  ];

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }));
  };

  const activeFilterCount = Object.values(filterValues).filter((v) => {
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") {
      return v[0] !== 0 || v[1] !== 20000;
    }
    if (Array.isArray(v)) return v.length > 0;
    return !!v;
  }).length;

  const clearAllFilters = () => setFilterValues({});

  const activeChips = useMemo(() => {
    const chips: { filterId: string; label: string; value: string }[] = [];
    for (const config of filterConfigs) {
      const val = filterValues[config.id];
      if (!val) continue;
      if (config.filter_type === "range" && Array.isArray(val)) {
        const pc = config.config || {};
        if (val[0] !== (pc.min ?? 0) || val[1] !== (pc.max ?? 20000))
          chips.push({ filterId: config.id, label: config.label, value: `AED ${val[0]}–${val[1]}` });
      } else if (Array.isArray(val)) {
        val.forEach((v: string) => {
          const option = config.options?.find(opt => opt.value === v);
          if (option) {
            chips.push({ filterId: config.id, label: config.label, value: option.label });
          }
        });
      }
    }
    return chips;
  }, [filterValues, filterConfigs]);

  const removeChip = (filterId: string, chipValue: string) => {
    const val = filterValues[filterId];
    if (Array.isArray(val) && typeof val[0] !== "number") {
      const config = filterConfigs.find(c => c.id === filterId);
      const option = config?.options?.find(opt => opt.label === chipValue);
      if (option) {
        handleFilterChange(filterId, val.filter((v: string) => v !== option.value));
      }
    } else {
      handleFilterChange(filterId, undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-2 pb-16">
        <div className="container">
          {/* Toolbar */}
          <div className="flex items-center justify-between py-3 border-b border-border/40 mb-0">
            <div className="flex items-center gap-2">
              <Button variant={filtersOpen ? "default" : "outline"} size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-1.5 h-8 text-xs font-semibold rounded-lg">
                <SlidersHorizontal className="h-3.5 w-3.5" />Filters
                {activeFilterCount > 0 && <Badge variant="secondary" className="ml-0.5 h-4 min-w-[16px] p-0 flex items-center justify-center text-[9px] rounded-full">{activeFilterCount}</Badge>}
              </Button>
              <span className="text-xs text-muted-foreground">
                {productsLoading ? (
                  "Loading..."
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{products.length}</span> results
                    {searchTerm && <span> for "<span className="font-medium text-foreground">{searchTerm}</span>"</span>}
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center border border-border/50 rounded-lg overflow-hidden">
                <button onClick={() => setGridCols(3)} className={`p-1.5 transition-colors ${gridCols === 3 ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Grid3X3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => setGridCols(4)} className={`p-1.5 transition-colors ${gridCols === 4 ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid className="h-3.5 w-3.5" /></button>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-8 text-xs rounded-lg border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>{SORT_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide">
              {activeChips.map((chip, i) => (
                <Badge key={`${chip.filterId}-${chip.value}-${i}`} variant="secondary" className="shrink-0 gap-1 pr-1 text-xs font-medium rounded-md cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => removeChip(chip.filterId, chip.value)}>
                  {chip.value}<X className="h-3 w-3" />
                </Badge>
              ))}
              <button onClick={clearAllFilters} className="shrink-0 text-[11px] text-muted-foreground hover:text-destructive font-medium transition-colors">Clear all</button>
            </div>
          )}

          {/* Mobile filter drawer */}
          {isMobile && (
            <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader>
                  <DrawerTitle className="flex items-center justify-between">
                    Filters
                    {activeFilterCount > 0 && <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground text-xs gap-1"><X className="h-3 w-3" /> Clear all</Button>}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-2 overflow-y-auto">
                  <SearchFilters filterValues={filterValues} onFilterChange={handleFilterChange} />
                </div>
                <DrawerFooter>
                  <DrawerClose asChild><Button className="w-full rounded-xl">Show {products.length} result{products.length !== 1 ? "s" : ""}</Button></DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}

          {/* Main Content */}
          <div className="flex gap-5 pt-4">
            {!isMobile && (
              <AnimatePresence>
                {filtersOpen && (
                  <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="shrink-0 overflow-hidden">
                    <div className="w-[240px] pr-4 border-r border-border/30">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground">Filters</h3>
                        {activeFilterCount > 0 && <button onClick={clearAllFilters} className="text-[11px] text-primary hover:underline font-medium">Reset all</button>}
                      </div>
                      <SearchFilters filterValues={filterValues} onFilterChange={handleFilterChange} />
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>
            )}

            <div className="flex-1 min-w-0">
              {productsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg aspect-[3/4] mb-2" />
                      <div className="bg-muted rounded h-4 mb-1" />
                      <div className="bg-muted rounded h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No products found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or search term</p>
                </div>
              ) : (
                <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"} gap-3`}>
                  {products.map((p: Product) => {
                    const primaryImage = p.images?.find((img) => img.is_primary)?.image_url || p.images?.[0]?.image_url || "/placeholder.svg";
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <ProductCard 
                          name={p.name} 
                          brand={p.brand?.name || "Unknown"} 
                          price={p.price} 
                          originalPrice={p.original_price || undefined}
                          image={primaryImage} 
                          rating={4.5} 
                          reviews={0} 
                          vendor={p.vendor?.store_name || "BitStores"}
                          specs={{ 
                            ram: p.ram || "–", 
                            storage: p.storage || "–", 
                            camera: p.camera || "–" 
                          }} 
                          slug={p.slug}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
