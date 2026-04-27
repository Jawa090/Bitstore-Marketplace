import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search, ShoppingCart, User, Menu, X, LogOut, Store, Shield,
  Flame, Smartphone, Laptop, Tablet, Headphones, Watch, Gamepad2, Monitor,
  Heart, ChevronDown, Globe, Settings, MapPin, Package,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LocationModal from "@/components/LocationModal";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useThemeImage } from "@/hooks/useThemeImage";
import { categoryService } from "@/services/api/category.service";

interface NavLink { 
  label: string; 
  url: string; 
  highlight?: boolean; 
  position?: string; 
  icon?: string; 
}
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

// Helper function to map category names to icons
const getIconForCategory = (categoryName: string): string => {
  if (categoryName.includes('phone') || categoryName.includes('mobile')) return 'smartphone';
  if (categoryName.includes('laptop') || categoryName.includes('computer')) return 'laptop';
  if (categoryName.includes('tablet') || categoryName.includes('ipad')) return 'tablet';
  if (categoryName.includes('headphone') || categoryName.includes('audio') || categoryName.includes('accessory')) return 'headphones';
  if (categoryName.includes('watch')) return 'watch';
  if (categoryName.includes('gaming') || categoryName.includes('game')) return 'gamepad';
  if (categoryName.includes('monitor') || categoryName.includes('display')) return 'monitor';
  return 'smartphone'; // default
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Dubai");
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: settings } = useStoreSettings();

  // Fetch categories from backend
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Log error for debugging
  if (error) {
    console.error('Failed to fetch categories:', error);
  }

  const defaultLogo = useThemeImage("logo");
  const logo = settings?.logo_url || defaultLogo;
  const storeName = settings?.store_name || "BitStores";

  // Convert backend categories to nav links format - with safety check
  const categoryLinks = (Array.isArray(categories) && categories.length > 0)
    ? categories
        .filter(cat => cat && cat.is_active)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .slice(0, 8) // Limit to 8 categories for navbar
        .map(cat => ({
          label: cat.name,
          url: `/search?category=${cat.slug}`,
          icon: getIconForCategory(cat.name.toLowerCase())
        }))
    : [];

  // Static special links
  const specialLinks = [
    { label: "Live Auctions", url: "/auctions", highlight: true },
    { label: "Hot Deals", url: "/search?deals=true", highlight: true },
    { label: "Sell on BitStores", url: "/vendor/apply", position: "right" },
  ];

  const mainLinks = [...categoryLinks, ...specialLinks.filter(l => !l.position)];
  const rightLinks = specialLinks.filter(l => l.position === "right");

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

  // Language options
  const languages = [
    { code: "EN", name: "English", flag: "🇺🇸" },
    { code: "AR", name: "العربية", flag: "🇸🇦" },
    { code: "UR", name: "اردو", flag: "🇵🇰" },
    { code: "HI", name: "हिन्दी", flag: "🇮🇳" },
  ];

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <nav className={`sticky top-0 z-50 bg-background border-b transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-black/5 border-border/50" : "border-border/30"}`}>
      {/* Main Navigation Bar */}
      <div className="bg-background">
        <div className="container flex items-center gap-2 lg:gap-4 h-[60px] lg:h-16 px-4">
          {/* Logo */}
          <Link to="/" className="shrink-0 mr-2">
            <img src={logo} alt={storeName} className="h-8 sm:h-10" />
          </Link>

          {/* Location Delivery (Amazon style) */}
          <div 
            className="hidden lg:flex items-center text-xs text-muted-foreground hover:text-foreground cursor-pointer mr-2"
            onClick={() => setLocationModalOpen(true)}
          >
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px]">Delivering to</span>
              <span className="font-semibold text-foreground">{currentLocation}</span>
            </div>
          </div>

          {/* Search Bar - Amazon Style */}
          <form onSubmit={handleSearch} className="flex-1 max-w-4xl">
            <div className="flex items-center">
              {/* Category Dropdown */}
              <div className="hidden md:flex">
                <select 
                  className="h-10 lg:h-11 px-3 bg-muted border border-r-0 border-border rounded-l-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onChange={(e) => {
                    if (e.target.value) {
                      navigate(`/search?category=${e.target.value}`);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">All</option>
                  {(Array.isArray(categories) && categories.length > 0) && categories.filter(cat => cat && cat.is_active).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Search Input */}
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)} 
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search phones, laptops, accessories..."
                  className={`w-full h-10 lg:h-11 px-4 border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${searchFocused ? "border-primary bg-background" : "border-border bg-background hover:border-border"} ${window.innerWidth >= 768 ? "rounded-none" : "rounded-l-md"}`}
                />
              </div>
              
              {/* Search Button */}
              <button 
                type="submit" 
                className="h-10 lg:h-11 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-r-md flex items-center justify-center"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Language Selector with Flyout (Amazon style) */}
            <div 
              className="hidden lg:flex items-center text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 relative"
              onMouseEnter={() => setLanguageOpen(true)}
              onMouseLeave={() => setLanguageOpen(false)}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm">{currentLanguage.flag}</span>
                <span className="font-semibold">{selectedLanguage}</span>
                <ChevronDown className="h-3 w-3" />
              </div>

              {/* Language Flyout */}
              <AnimatePresence>
                {languageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-lg z-50"
                    onMouseEnter={() => setLanguageOpen(true)}
                    onMouseLeave={() => setLanguageOpen(false)}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Change Language</span>
                      </div>
                      
                      <div className="space-y-2">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setSelectedLanguage(lang.code);
                              setLanguageOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-muted/60 transition-colors ${
                              selectedLanguage === lang.code ? 'bg-primary/10 border border-primary/20' : ''
                            }`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{lang.name}</span>
                                <span className="text-xs text-muted-foreground">- {lang.code}</span>
                              </div>
                            </div>
                            {selectedLanguage === lang.code && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-border mt-3 pt-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <span>💱</span>
                          <span>Currency: AED (Default)</span>
                        </div>
                        <Link 
                          to="/settings/language"
                          className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-medium"
                          onClick={() => setLanguageOpen(false)}
                        >
                          <Settings className="h-3 w-3" />
                          Change Language & Currency Settings
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Account */}
            {user ? (
              <div className="hidden sm:flex items-center">
                {/* Avatar */}
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                    {(user.full_name || user.email)[0].toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2">
                  <span className="text-[10px]">Hello, {user.full_name || user.email.split('@')[0]}</span>
                  <span className="font-semibold">Account & Lists</span>
                </div>
                <Link to="/vendor">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9" title="Vendor Dashboard">
                    <Store className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9" onClick={signOut} title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex">
                <div className="flex flex-col text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2">
                  <span className="text-[10px]">Hello, sign in</span>
                  <span className="font-semibold">Account & Lists</span>
                </div>
              </Link>
            )}

            {/* Returns & Orders */}
            <Link to={user ? "/orders" : "/login"}>
              <div className="hidden lg:flex flex-col text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2">
                <span className="text-[10px]">Returns</span>
                <span className="font-semibold">& Orders</span>
              </div>
            </Link>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground h-9 w-9">
              <Heart className="h-4 w-4" />
            </Button>

            {/* Cart */}
            <Link to="/cart">
              <div className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer px-2 relative">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block ml-1 text-xs font-semibold">Cart</span>
              </div>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground h-9 w-9" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar - Amazon Style */}
      <div className="bg-muted/30 border-t border-border/20">
        <div className="container flex items-center h-10 text-xs overflow-x-auto scrollbar-hide gap-1 px-4">
          {/* All Categories Button */}
          <Link to="/search" className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-medium text-xs rounded whitespace-nowrap shrink-0 transition-colors">
            <Menu className="h-3.5 w-3.5" />
            All Categories
          </Link>

          {/* Category Links */}
          {mainLinks.filter(l => !('highlight' in l) || !l.highlight).map((link) => {
            const Icon = ('icon' in link && link.icon) ? iconMap[link.icon] : null;
            const isActive = location.search ? link.url.includes(location.search) : false;
            return (
              <Link 
                key={link.label} 
                to={link.url} 
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded whitespace-nowrap transition-all duration-150 shrink-0 text-xs font-medium ${
                  isActive 
                    ? "text-primary bg-primary/10 font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {link.label}
              </Link>
            );
          })}

          {/* Special Deals */}
          {mainLinks.filter(l => ('highlight' in l) && l.highlight).map((link) => (
            <Link 
              key={link.label} 
              to={link.url} 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded whitespace-nowrap font-semibold text-destructive hover:bg-destructive/10 transition-all duration-150 shrink-0 text-xs"
            >
              {link.label.includes("Auction") && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                </span>
              )}
              {link.label.includes("Deal") && <Flame className="h-3.5 w-3.5" />}
              {link.label}
            </Link>
          ))}

          {/* Vendor Link */}
          <div className="flex-1" />
          {rightLinks.map((link) => (
            <Link 
              key={link.label} 
              to={link.url} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold whitespace-nowrap text-xs border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 shrink-0"
            >
              <Store className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.2 }} 
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-2 px-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-3">
                <div className="flex items-center">
                  <select 
                    className="h-11 px-3 bg-muted border border-r-0 border-border rounded-l-md text-xs text-foreground"
                    onChange={(e) => {
                      if (e.target.value) {
                        navigate(`/search?category=${e.target.value}`);
                        setMobileOpen(false);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">All</option>
                    {(Array.isArray(categories) && categories.length > 0) && categories.filter(cat => cat && cat.is_active).slice(0, 10).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search products..." 
                    className="flex-1 h-11 px-4 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="h-11 px-4 bg-primary text-primary-foreground rounded-r-md">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Mobile Location Selector */}
              <div 
                className="flex items-center gap-2.5 text-foreground py-3 px-3 rounded-lg bg-muted/60 text-sm mb-3 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => {
                  setLocationModalOpen(true);
                  setMobileOpen(false);
                }}
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Delivering to</span>
                  <span className="font-medium">{currentLocation}</span>
                </div>
              </div>

              {/* User Account Section */}
              {!user ? (
                <Link to="/login" className="flex items-center gap-2.5 text-primary font-semibold py-3 px-3 rounded-lg hover:bg-primary/10 text-sm border border-primary/30" onClick={() => setMobileOpen(false)}>
                  <User className="h-4 w-4" /> 
                  Hello, sign in
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 text-foreground py-3 px-3 rounded-lg bg-muted/60 text-sm">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="h-7 w-7 rounded-full object-cover border border-primary/30"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {(user.full_name || user.email)[0].toUpperCase()}
                    </div>
                  )}
                  Hello, {user.full_name || user.email.split('@')[0]}
                </div>
              )}

              {/* Categories */}
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1 mt-2">Categories</p>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {mainLinks.filter(l => !('highlight' in l) || !l.highlight).map((link) => {
                  const Icon = ('icon' in link && link.icon) ? iconMap[link.icon] : null;
                  return (
                    <Link 
                      key={link.label} 
                      to={link.url} 
                      className="flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors text-sm font-medium text-foreground" 
                      onClick={() => setMobileOpen(false)}
                    >
                      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Special Deals */}
              <div className="flex gap-2 mb-3">
                {mainLinks.filter(l => ('highlight' in l) && l.highlight).map((link) => (
                  <Link 
                    key={link.label} 
                    to={link.url} 
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-destructive/10 text-destructive font-semibold text-sm" 
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label.includes("Auction") && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                      </span>
                    )}
                    {link.label.includes("Deal") && <Flame className="h-4 w-4" />}
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Vendor Link */}
              {rightLinks.map((link) => (
                <Link 
                  key={link.label} 
                  to={link.url} 
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm mb-3" 
                  onClick={() => setMobileOpen(false)}
                >
                  <Store className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}

              {/* Account Actions */}
              <div className="border-t border-border pt-3 space-y-1">
                {user && (
                  <>
                    <Link to="/orders" className="flex items-center gap-2.5 text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/60 text-sm w-full text-left" onClick={() => setMobileOpen(false)}>
                      <Package className="h-4 w-4 text-muted-foreground" /> Your Orders
                    </Link>
                    <Link to="/vendor" className="flex items-center gap-2.5 text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/60 text-sm w-full text-left" onClick={() => setMobileOpen(false)}>
                      <Store className="h-4 w-4 text-muted-foreground" /> Vendor Dashboard
                    </Link>
                    <button className="flex items-center gap-2.5 text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/60 text-sm w-full text-left" onClick={() => { signOut(); setMobileOpen(false); }}>
                      <LogOut className="h-4 w-4 text-muted-foreground" /> Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
      />
    </nav>
  );
};

export default Navbar;
