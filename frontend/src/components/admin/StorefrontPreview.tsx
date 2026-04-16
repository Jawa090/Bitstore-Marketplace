import { Link } from "react-router-dom";
import { Truck, RotateCcw, ShieldCheck, CreditCard, Sparkles, ArrowRight, ChevronRight, Package } from "lucide-react";
import { Smartphone, Laptop, Tablet, Headphones, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconLookup: Record<string, typeof Smartphone> = {
  smartphone: Smartphone, laptop: Laptop, tablet: Tablet,
  headphones: Headphones, watch: Watch,
};

const trustIcons = [Truck, RotateCcw, ShieldCheck, CreditCard];

export function AnnouncementPreview({ content }: { content: any }) {
  return (
    <div className="bg-primary text-primary-foreground text-center py-2.5 text-xs font-medium tracking-wide rounded">
      {content.text || "Announcement text"}
    </div>
  );
}

export function HeroBannerPreview({ content }: { content: any }) {
  const banner = content.banners?.[0];
  if (!banner) return <p className="text-muted-foreground text-sm">No banners added</p>;

  return (
    <div className="relative overflow-hidden rounded-xl" style={{ background: "var(--gradient-hero)" }}>
      <div className="min-h-[200px] flex items-center relative">
        {banner.image_url && (
          <img src={banner.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="relative z-10 p-8 max-w-md">
          {banner.badge_text && (
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
              {banner.badge_text}
            </span>
          )}
          <h2 className="text-2xl font-bold mb-2">{banner.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">{banner.subtitle}</p>
          <Button size="sm" className="bg-primary text-primary-foreground">
            {banner.cta_text || "Shop Now"} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      {content.banners?.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {content.banners.map((_: any, i: number) => (
            <div key={i} className={`h-1.5 rounded-full ${i === 0 ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TrustBadgesPreview({ content }: { content: any }) {
  const badges = content.badges || [];
  return (
    <div className="py-3 border-y border-border/50 bg-card/50 rounded-lg">
      <div className="flex items-center justify-around gap-4 px-4">
        {badges.map((badge: any, i: number) => {
          const Icon = trustIcons[i] || ShieldCheck;
          return (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-xs">{badge.title}</p>
                <p className="text-[10px] text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CategoryPreview({ content }: { content: any }) {
  const categories = content.categories || [];
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-bold">{content.title}</h3>
        <p className="text-xs text-muted-foreground">{content.subtitle}</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {categories.map((cat: any, i: number) => {
          const Icon = iconLookup[cat.icon] || Package;
          return (
            <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card min-w-[90px]">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="h-10 w-10 object-contain" />
              ) : (
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <span className="font-semibold text-xs text-center">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FeaturedPreview({ content }: { content: any }) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg font-bold">{content.title}</h3>
          <p className="text-xs text-muted-foreground">{content.subtitle}</p>
        </div>
        <span className="text-primary text-xs font-medium">View All →</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: Math.min(content.show_count || 4, 4) }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="aspect-square rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
              Product {i + 1}
            </div>
            <div className="h-2 w-3/4 rounded bg-muted" />
            <div className="h-2 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PromoPreview({ content }: { content: any }) {
  return (
    <div className="relative rounded-xl overflow-hidden p-6" style={{ background: "var(--gradient-card)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
      <div className="relative z-10 max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs mb-3">
          <Sparkles className="h-3 w-3" />
          AI Tech Assistant
        </div>
        <h3 className="text-xl font-bold mb-2">{content.title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{content.subtitle}</p>
        {content.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {content.suggestions.slice(0, 3).map((q: string) => (
              <span key={q} className="px-2 py-1 rounded-full bg-secondary border border-border text-[10px] text-muted-foreground">
                "{q}"
              </span>
            ))}
          </div>
        )}
        <Button size="sm" className="bg-primary text-primary-foreground">
          {content.cta_text || "Try AI"} <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function FooterPreview({ content }: { content: any }) {
  const columns = content.columns || [];
  return (
    <div className="py-4 border-t border-border rounded-lg">
      <div className="grid grid-cols-3 gap-6 px-4">
        {columns.map((col: any, i: number) => (
          <div key={i}>
            <h4 className="font-semibold text-xs mb-2">{col.title}</h4>
            <ul className="space-y-1">
              {col.links?.map((link: any, j: number) => (
                <li key={j} className="text-[11px] text-muted-foreground">{link.label}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const previewComponents: Record<string, React.ComponentType<{ content: any }>> = {
  announcement_bar: AnnouncementPreview,
  hero_banners: HeroBannerPreview,
  trust_badges: TrustBadgesPreview,
  category_showcase: CategoryPreview,
  featured_products: FeaturedPreview,
  promo_banner: PromoPreview,
  footer: FooterPreview,
};

export function SectionPreview({ sectionId, content }: { sectionId: string; content: any }) {
  const Component = previewComponents[sectionId];
  if (!Component) return null;
  return <Component content={content} />;
}
