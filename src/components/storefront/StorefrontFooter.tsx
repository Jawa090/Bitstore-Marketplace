import { useState } from "react";
import { Link } from "react-router-dom";
import { useStorefrontContent } from "@/hooks/useStorefrontContent";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useThemeImage } from "@/hooks/useThemeImage";
import {
  CreditCard, Shield, Truck, Headphones, Instagram, Facebook, Twitter,
  MapPin, Phone, Mail, ArrowRight, ChevronUp, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FooterLink { label: string; url: string; }
interface FooterColumn { title: string; links: FooterLink[]; }
interface FooterData { columns: FooterColumn[]; }

const fallback: FooterData = {
  columns: [
    {
      title: "Shop",
      links: [
        { label: "All Products", url: "/search" },
        { label: "iPhones", url: "/search?brand=Apple" },
        { label: "Samsung", url: "/search?brand=Samsung" },
        { label: "Laptops", url: "/search?category=laptops" },
        { label: "Accessories", url: "/accessories" },
        { label: "New Arrivals", url: "/search?sort=newest" },
      ],
    },
    {
      title: "Sell With Us",
      links: [
        { label: "Become a Vendor", url: "/vendor/apply" },
        { label: "Vendor Dashboard", url: "/vendor" },
        { label: "Trade In", url: "/trade-in" },
        { label: "Wholesale / B2B", url: "/wholesale" },
      ],
    },
    {
      title: "Help & Info",
      links: [
        { label: "Help Center", url: "/help" },
        { label: "Shipping Info", url: "/shipping" },
        { label: "Returns & Refunds", url: "/returns" },
        { label: "Contact Us", url: "/contact" },
        { label: "Track My Order", url: "/help" },
      ],
    },
  ],
};

const trustItems = [
  { icon: Truck, title: "Free Delivery", desc: "Orders above 500 AED" },
  { icon: Shield, title: "Buyer Protection", desc: "100% secure checkout" },
  { icon: CreditCard, title: "Flexible Payments", desc: "Tabby · Tamara · COD" },
  { icon: Headphones, title: "24/7 Support", desc: "WhatsApp & live chat" },
];

const StorefrontFooter = () => {
  const { data } = useStorefrontContent<FooterData>("footer", fallback);
  const content = data?.content || fallback;
  const { data: settings } = useStoreSettings();
  const [email, setEmail] = useState("");

  const defaultLogo = useThemeImage("logo");
  const logo = settings?.logo_url || defaultLogo;
  const storeName = settings?.store_name || "BitStores";
  const tagline = settings?.tagline || "UAE's #1 marketplace for certified renewed smartphones, laptops & electronics.";
  const city = settings?.city || "Dubai";
  const region = settings?.region || "Sharjah";
  const currency = settings?.currency || "AED";
  const country = settings?.country || "UAE";

  const socials = [
    { url: settings?.social_instagram || "#", icon: Instagram, label: "Instagram" },
    { url: settings?.social_facebook || "#", icon: Facebook, label: "Facebook" },
    { url: settings?.social_twitter || "#", icon: Twitter, label: "X (Twitter)" },
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative">
      {/* ── Trust Strip ── */}
      <div className="bg-[hsl(222,47%,8%)] text-white border-b border-white/10">
        <div className="container py-6 lg:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {trustItems.map((item) => (
              <div key={item.title} className="flex items-center gap-3 group">
                <div className="p-2.5 rounded-2xl bg-white/[0.07] group-hover:bg-white/[0.12] transition-colors shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-[11px] text-white/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ── Main Footer ── */}
      <div className="bg-[hsl(222,47%,8%)] text-white">
        <div className="container py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand column — spans 2 */}
            <div className="col-span-2">
              <img src={logo} alt={storeName} className="h-10 mb-4 brightness-0 invert" />
              <p className="text-sm text-white/50 mb-6 max-w-xs leading-relaxed">{tagline}</p>

              {/* Contact info */}
              <div className="space-y-2.5 mb-6">
                <a href={`mailto:support@bitstores.ae`} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> support@bitstores.ae
                </a>
                <a href="tel:+97145551234" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> +971 4 555 1234
                </a>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {city} & {region}, {country}
                </div>
              </div>

              {/* Social icons */}
              <div className="flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.15] transition-all"
                    aria-label={s.label}
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {content.columns.map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-white/80">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.url}
                        className="text-sm text-white/45 hover:text-white hover:translate-x-0.5 transition-all inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* App / extra column */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-white/80">Download App</h4>
              <p className="text-sm text-white/45 mb-4 leading-relaxed">Get the best deals on the go. Available soon on iOS & Android.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.07] border border-white/10">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/70 shrink-0" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div>
                    <p className="text-[9px] text-white/40 leading-none">Coming soon on</p>
                    <p className="text-xs font-semibold text-white/80">App Store</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.07] border border-white/10">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/70 shrink-0" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.08 12l2.618-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/></svg>
                  <div>
                    <p className="text-[9px] text-white/40 leading-none">Coming soon on</p>
                    <p className="text-xs font-semibold text-white/80">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment Methods ── */}
        <div className="border-t border-white/[0.06]">
          <div className="container py-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/30">We accept</p>
              <div className="flex items-center gap-2.5">
                {/* Visa */}
                <div className="w-12 h-8 rounded-md bg-white flex items-center justify-center">
                  <svg viewBox="0 0 48 32" className="h-5 w-8"><path d="M19.5 25.2h-3.8L18.2 7h3.8l-2.5 18.2zm16-18.2l-3.6 12.5-1.5-7.6-.4-2.2c-.7-1.8-2.9-3.8-5.3-4.8L28.8 25h4l6-18h-3.3zm7.5 18.2h3.5L43.5 7h-3c-1.4 0-2.3.8-2.7 2l-5.7 16.2h4l.8-2.2h4.8l.3 2.2zM38.2 19l2-5.4 1.1 5.4h-3.1zM17 7l-3.6 12.4L12 9.2c-.3-1.4-1.4-2.2-2.6-2.2H3.1l-.1.4c2 .5 3.7 1.3 4.9 2.2L11.5 25H15.5L21 7h-4z" fill="#1A1F71"/></svg>
                </div>
                {/* Mastercard */}
                <div className="w-12 h-8 rounded-md bg-white flex items-center justify-center">
                  <svg viewBox="0 0 48 32" className="h-5 w-8">
                    <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                    <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                    <path d="M24 8.8a10 10 0 000 14.4 10 10 0 000-14.4z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* AMEX */}
                <div className="w-12 h-8 rounded-md bg-[#006FCF] flex items-center justify-center">
                  <span className="text-[8px] font-black text-white tracking-tight leading-none">AMEX</span>
                </div>
                {/* Apple Pay */}
                <div className="w-12 h-8 rounded-md bg-black flex items-center justify-center border border-white/20">
                  <svg viewBox="0 0 50 20" className="h-3.5 w-9" fill="white">
                    <path d="M9.2 2.6c-.6.7-1.5 1.3-2.4 1.2-.1-1 .4-2 .9-2.6C8.3.5 9.3 0 10.1 0c.1 1-.3 2-.9 2.6zm.9 1.3c-1.3-.1-2.5.8-3.1.8s-1.6-.7-2.7-.7C2.8 4 1.5 5 .8 6.5c-1.5 2.5-.4 6.3 1 8.4.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2.1.8-1.2 1.1-2.3 1.1-2.4 0 0-2.2-.8-2.2-3.3 0-2 1.7-3 1.7-3-.9-1.4-2.4-1.6-2.8-1.6z"/>
                    <path d="M20 1.2h-3.8L12.8 17h2.5l1.1-3.5h4l1.2 3.5h2.5L20 1.2zm-3 10.3l1.3-4c.2-.5.4-1.3.5-1.7h0c.2.4.3 1.2.5 1.7l1.3 4h-3.6z"/>
                    <path d="M33 1.2h-2.3l-4.5 15.8h2.3L29.6 13h.1c.1-.4.7-2.2 1.5-4.3l1.6-4.5h3.8l-3 8.5c-1 2.6-.8 3-.8 3.3h0c0 .2-.1.5.5.5h1.5L38 17h-2.5L33 1.2z"/>
                    <path d="M42 17.2c2.4 0 4.3-1.3 4.3-3.5 0-1.7-1.2-2.7-3.1-3.3L42 10c-1.1-.4-1.5-.7-1.5-1.3 0-.7.7-1.2 1.7-1.2.9 0 1.6.3 2 .6l.7-1.8c-.7-.4-1.5-.7-2.7-.7-2.2 0-3.9 1.3-3.9 3.3 0 1.5 1 2.6 2.8 3.2l1.2.4c1.2.4 1.7.8 1.7 1.4 0 .8-.7 1.3-1.9 1.3-1 0-2-.4-2.6-.9l-.8 1.8c.8.6 2 1.1 3.3 1.1z"/>
                  </svg>
                </div>
                {/* Tabby */}
                <div className="w-12 h-8 rounded-md bg-[#3CFFD0] flex items-center justify-center">
                  <span className="text-[8px] font-black text-black tracking-tight">tabby</span>
                </div>
                {/* Tamara */}
                <div className="w-12 h-8 rounded-md bg-[#1C3641] flex items-center justify-center">
                  <span className="text-[8px] font-black text-[#FF6B35] tracking-tight">tamara</span>
                </div>
                {/* COD */}
                <div className="w-12 h-8 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white/70">COD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-white/[0.06]">
          <div className="container py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-white/30">
                © {new Date().getFullYear()} {storeName}. All rights reserved. Licensed under UAE DED.
              </p>
              <div className="flex items-center gap-4 text-[11px] text-white/30">
                <span className="flex items-center gap-1">🇦🇪 {country}</span>
                <span>·</span>
                <span>{currency}</span>
                <span>·</span>
                <Link to="/help" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
                <span>·</span>
                <Link to="/help" className="hover:text-white/70 transition-colors">Terms of Service</Link>
                <span>·</span>
                <Link to="/help" className="hover:text-white/70 transition-colors">Cookie Policy</Link>
              </div>
              <button
                onClick={scrollToTop}
                className="p-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] text-white/50 hover:text-white transition-all"
                aria-label="Back to top"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StorefrontFooter;
