import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, Store, ShoppingBag, Package, Users } from "lucide-react";

interface SearchResult {
  id: string;
  label: string;
  sub: string;
  type: "vendor" | "order" | "product" | "user";
  url: string;
}

export function AdminGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }

    const [vendors, orders, products, users] = await Promise.all([
      supabase.from("vendors").select("id, store_name, emirate, status").ilike("store_name", `%${q}%`).limit(5),
      supabase.from("orders").select("id, total_amount, delivery_emirate, status").or(`id.ilike.%${q}%,delivery_emirate.ilike.%${q}%`).limit(5),
      supabase.from("products").select("id, name, brand, slug").ilike("name", `%${q}%`).limit(5),
      supabase.from("profiles").select("user_id, display_name, email").or(`display_name.ilike.%${q}%,email.ilike.%${q}%`).limit(5),
    ]);

    const res: SearchResult[] = [
      ...(vendors.data || []).map((v) => ({
        id: v.id,
        label: v.store_name,
        sub: `${v.emirate} · ${v.status}`,
        type: "vendor" as const,
        url: "/admin/vendors",
      })),
      ...(orders.data || []).map((o) => ({
        id: o.id,
        label: `Order #${o.id.slice(0, 8)}`,
        sub: `AED ${Number(o.total_amount).toLocaleString()} · ${o.delivery_emirate}`,
        type: "order" as const,
        url: "/admin/orders",
      })),
      ...(products.data || []).map((p) => ({
        id: p.id,
        label: p.name,
        sub: p.brand,
        type: "product" as const,
        url: "/admin/products",
      })),
      ...(users.data || []).map((u) => ({
        id: u.user_id,
        label: u.display_name || u.email || "Unknown",
        sub: u.email || "",
        type: "user" as const,
        url: "/admin/users",
      })),
    ];
    setResults(res);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const icons = { vendor: Store, order: ShoppingBag, product: Package, user: Users };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background text-[10px] font-mono border border-border/50">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search vendors, orders, products, users..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {(["vendor", "order", "product", "user"] as const).map((type) => {
            const items = results.filter((r) => r.type === type);
            if (items.length === 0) return null;
            const Icon = icons[type];
            return (
              <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1) + "s"}>
                {items.map((r) => (
                  <CommandItem
                    key={r.id}
                    onSelect={() => { navigate(r.url); setOpen(false); }}
                    className="gap-3"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.sub}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
