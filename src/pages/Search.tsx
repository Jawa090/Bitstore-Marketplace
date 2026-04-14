import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Grid3X3, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SearchFilters from "@/components/search/SearchFilters";
import { mockProducts, mockFilterConfig } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest First" },
];

const FILTER_FIELD_MAP: Record<string, string> = {
  brand: "brand", condition: "condition", storage: "storage", ram: "ram", color: "color",
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const filterConfigs = mockFilterConfig;

  const handleFilterChange = (filterId: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }));
  };

  const filtered = useMemo(() => {
    let results = mockProducts.filter((p) => p.is_active);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    }

    for (const config of filterConfigs) {
      const val = filterValues[config.id];
      if (!val) continue;
      if (config.filter_type === "range" && Array.isArray(val)) {
        results = results.filter((p) => p.price >= val[0] && p.price <= val[1]);
      } else if (Array.isArray(val) && val.length > 0) {
        const field = FILTER_FIELD_MAP[config.id];
        if (field) {
          results = results.filter((p) => {
            const productVal = (p as any)[field];
            return productVal && val.includes(productVal);
          });
        } else if (config.id === "vendor") {
          results = results.filter((p) => val.includes(p.vendor?.store_name));
        }
      }
    }

    switch (sortBy) {
      case "price_asc": results.sort((a, b) => a.price - b.price); break;
      case "price_desc": results.sort((a, b) => b.price - a.price); break;
      case "newest": results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    }
    return results;
  }, [searchTerm, filterValues, filterConfigs, sortBy]);

  const activeFilterCount = Object.values(filterValues).filter((v) => {
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") {
      const priceConfig = filterConfigs.find((f) => f.filter_type === "range")?.config;
      if (priceConfig && v[0] === (priceConfig.min ?? 0) && v[1] === (priceConfig.max ?? 20000)) return false;
      return true;
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
        val.forEach((v: string) => chips.push({ filterId: config.id, label: config.label, value: v }));
      }
    }
    return chips;
  }, [filterValues, filterConfigs]);

  const removeChip = (filterId: string, chipValue: string) => {
    const val = filterValues[filterId];
    if (Array.isArray(val) && typeof val[0] !== "number") {
      handleFilterChange(filterId, val.filter((v: string) => v !== chipValue));
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
                <span className="font-semibold text-foreground">{filtered.length}</span> results
                {searchTerm && <span> for "<span className="font-medium text-foreground">{searchTerm}</span>"</span>}
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
                  <DrawerClose asChild><Button className="w-full rounded-xl">Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}</Button></DrawerClose>
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
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No products found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or search term</p>
                </div>
              ) : (
                <div className={`grid grid-cols-2 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"} gap-3`}>
                  {filtered.map((p) => {
                    const primaryImage = p.images?.find((img) => img.is_primary)?.image_url || p.images?.[0]?.image_url || "/placeholder.svg";
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <ProductCard name={p.name} brand={p.brand} price={p.price} originalPrice={p.original_price || undefined}
                          image={primaryImage} rating={4.5} reviews={0} vendor={p.vendor?.store_name || "BitStores"}
                          specs={{ ram: p.ram || "–", storage: p.storage || "–", camera: p.camera || "–" }} slug={p.slug}
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
