import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search, ShoppingCart, User, Menu, X, LogOut, Store, Shield,
  Flame, Smartphone, Laptop, Tablet, Headphones, Watch, Gamepad2, Monitor,
  Heart,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useThemeImage } from "@/hooks/useThemeImage";

interface NavLink { label: string; url: string; highlight?: boolean; position?: string; icon?: string; }
interface NavCatData { links: NavLink[]; }
const defaultNavLinks: NavCatData = {
  links: [
    { label: "iPhones", url: "/search?brand=Apple", icon: "smartphone" },
    { label: "Samsung", url: "/search?brand=Samsung", icon: "smartphone" },
    { label: "Laptops", url: "/search?category=laptops", icon: "laptop" },
    { label: "iPads", url: "/search?category=ipads", icon: "tablet" },
    { label: "Accessories", url: "/accessories", icon: "headphones" },
    { label: "Watches", url: "/search?category=watches", icon: "watch" },
    { label: "Gaming", url: "/search?category=gaming", icon: "gamepad" },
    { label: "Monitors", url: "/search?category=monitors", icon: "monitor" },
    { label: "Live Auctions", url: "/auctions", highlight: true },
    { label: "Hot Deals", url: "/search", highlight: true },
    { label: "Sell on BitStores", url: "/vendor/apply", position: "right" },
  ],
};

const iconMap: Record<string, typeof Smartphone> = {
  smartphone: Smartphone, laptop: Laptop, tablet: Tablet,
  headphones: Headphones, watch: Watch, gamepad: Gamepad2, monitor: Monitor,
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: settings } = useStoreSettings();

  const defaultLogo = useThemeImage("logo");
  const logo = settings?.logo_url || defaultLogo;
  const storeName = settings?.store_name || "BitStores";

  const { data: navCms } = useStorefrontContent<NavCatData>("nav_categories", defaultNavLinks);
  const navLinks = navCms?.content?.links || defaultNavLinks.links;
  const mainLinks = navLinks.filter(l => l.position !== "right");
  const rightLinks = navLinks.filter(l => l.position === "right");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  return (
    <nav className={`sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-black/5 border-border/50" : "border-border/30"}`}>
      <div className="container flex items-center gap-4 lg:gap-6 h-[60px] lg:h-16">
        <Link to="/" className="shrink-0">
          <img src={logo} alt={storeName} className="h-8 sm:h-10" />
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl">
          <div className={`relative w-full transition-all duration-200 ${searchFocused ? "scale-[1.01]" : ""}`}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search phones, laptops, accessories..."
              className={`w-full h-10 lg:h-11 pl-10 pr-20 rounded-full bg-muted/60 border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200 ${searchFocused ? "border-primary ring-2 ring-primary/15 bg-background" : "border-border/60 hover:border-border"}`}
            />
            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 lg:h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">Search</button>
          </div>
        </form>

        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <Link to="/search" className="md:hidden">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9"><Search className="h-5 w-5" /></Button>
          </Link>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground h-9 w-9"><Heart className="h-5 w-5" /></Button>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative h-9 w-9">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground">{totalItems > 9 ? "9+" : totalItems}</span>}
            </Button>
          </Link>
          {user ? (
            <div className="hidden sm:flex items-center gap-1">
              <Link to="/vendor"><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9" title="Vendor Dashboard"><Store className="h-5 w-5" /></Button></Link>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9" onClick={signOut} title="Sign out"><LogOut className="h-5 w-5" /></Button>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:flex">
              <Button size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"><User className="h-3.5 w-3.5" />Sign In</Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground h-9 w-9" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Category Bar — Desktop */}
      <div className="hidden md:block border-t border-border/20">
        <div className="container flex items-center h-10 text-[13px] overflow-x-auto scrollbar-hide gap-0.5">
          <Link to="/search" className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground font-semibold text-xs mr-1 hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0">
            <Menu className="h-3.5 w-3.5" />All Categories
          </Link>
          <div className="w-px h-4 bg-border/40 mx-0.5 shrink-0" />
          {mainLinks.filter(l => !l.highlight).map((link) => {
            const Icon = link.icon ? iconMap[link.icon] : null;
            const isActive = location.search ? link.url.includes(location.search) : false;
            return (
              <Link key={link.label} to={link.url} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md whitespace-nowrap transition-all duration-150 shrink-0 ${isActive ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium"}`}>
                {Icon && <Icon className="h-3.5 w-3.5" />}{link.label}
              </Link>
            );
          })}
          <div className="w-px h-4 bg-border/40 mx-0.5 shrink-0" />
          {mainLinks.filter(l => l.highlight).map((link) => (
            <Link key={link.label} to={link.url} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md whitespace-nowrap font-semibold text-destructive hover:bg-destructive/10 transition-all duration-150 shrink-0">
              {link.label.includes("Auction") && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" /></span>}
              {link.label.includes("Deal") && <Flame className="h-3.5 w-3.5" />}
              {link.label}
            </Link>
          ))}
          <div className="flex-1" />
          {rightLinks.map((link) => (
            <Link key={link.label} to={link.url} className="flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold whitespace-nowrap text-xs border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 shrink-0">
              <Store className="h-3.5 w-3.5" />{link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="md:hidden border-t border-border bg-background overflow-hidden">
            <div className="container py-4 flex flex-col gap-0.5">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                </div>
              </form>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">Categories</p>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {mainLinks.filter(l => !l.highlight).map((link) => {
                  const Icon = link.icon ? iconMap[link.icon] : null;
                  return (
                    <Link key={link.label} to={link.url} className="flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
                      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}{link.label}
                    </Link>
                  );
                })}
              </div>
              <div className="flex gap-2 mb-3">
                {mainLinks.filter(l => l.highlight).map((link) => (
                  <Link key={link.label} to={link.url} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm" onClick={() => setMobileOpen(false)}>
                    {link.label.includes("Auction") && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" /></span>}
                    {link.label.includes("Deal") && <Flame className="h-4 w-4" />}
                    {link.label}
                  </Link>
                ))}
              </div>
              {rightLinks.map((link) => (
                <Link key={link.label} to={link.url} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm mb-3" onClick={() => setMobileOpen(false)}>
                  <Store className="h-4 w-4" />{link.label}
                </Link>
              ))}
              <div className="border-t border-border pt-3 space-y-0.5">
                {!user && (
                  <Link to="/login" className="flex items-center gap-2.5 text-primary font-semibold py-2.5 px-3 rounded-xl hover:bg-primary/10 text-sm" onClick={() => setMobileOpen(false)}>
                    <User className="h-4 w-4" /> Sign In / Register
                  </Link>
                )}
                {user && (
                  <button className="flex items-center gap-2.5 text-foreground py-2.5 px-3 rounded-xl hover:bg-muted/60 text-sm w-full text-left" onClick={() => { signOut(); setMobileOpen(false); }}>
                    <LogOut className="h-4 w-4 text-muted-foreground" /> Sign Out
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
