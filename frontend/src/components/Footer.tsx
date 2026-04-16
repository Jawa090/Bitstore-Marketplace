import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useThemeImage } from "@/hooks/useThemeImage";

const Footer = () => {
  const { data: settings } = useStoreSettings();
  const defaultLogo = useThemeImage("logo");
  const logo = settings?.logo_url || defaultLogo;
  const storeName = settings?.store_name || "BitStores";
  const tagline = settings?.tagline || "UAE's premier AI-powered marketplace for mobile phones & accessories.";
  const city = settings?.city || "Dubai";
  const region = settings?.region || "Sharjah";
  const currency = settings?.currency || "AED";
  const country = settings?.country || "UAE";

  return (
    <footer className="py-12 border-t border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <img src={logo} alt={storeName} className="h-14 mb-4" />
            <p className="text-sm text-muted-foreground">{tagline}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Smartphones</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Accessories</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Deals</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">New Arrivals</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Sell</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Become a Vendor</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Vendor Dashboard</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Shipping Guide</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>🇦🇪 {city} & {region}, {country}</span>
            <span>·</span>
            <span>{currency}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
