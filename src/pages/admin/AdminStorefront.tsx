import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Eye, EyeOff, Plus, Trash2, GripVertical } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { useDragReorder } from "@/hooks/useDragReorder";
import { SectionPreview } from "@/components/admin/StorefrontPreview";

const sectionLabels: Record<string, { title: string; desc: string }> = {
  announcement_bar: { title: "Announcement Bar", desc: "Top banner message shown across the store" },
  nav_categories: { title: "Navigation Links", desc: "Category links in the top navigation bar" },
  hero_banners: { title: "Hero Banners", desc: "Main carousel banners on the homepage" },
  trust_badges: { title: "Trust Badges", desc: "Warranty, delivery, returns bar below the hero" },
  flash_deals_section: { title: "Flash Deals", desc: "Countdown timer deals section" },
  category_showcase: { title: "Category Showcase", desc: "Shop by category section" },
  condition_showcase: { title: "Shop by Condition", desc: "New, Like New, Refurbished cards" },
  featured_products: { title: "Featured Products", desc: "Product grid section settings" },
  secondary_banners: { title: "Promo Banners", desc: "Mid-page promotional image banners" },
  new_arrivals: { title: "New Arrivals", desc: "Latest products section" },
  brand_showcase: { title: "Brand Showcase", desc: "Brand logos strip" },
  recently_viewed: { title: "Recently Viewed", desc: "Products the customer recently browsed" },
  trending_now: { title: "Trending Now", desc: "Most ordered products, auto-populated" },
  deal_of_the_day: { title: "Deal of the Day", desc: "Single featured product with large countdown" },
  wholesale: { title: "Wholesale & B2B", desc: "Bulk order banner and wholesale page content" },
  testimonials: { title: "Testimonials", desc: "Customer reviews section" },
  promo_banner: { title: "AI Promo Banner", desc: "BitBot AI assistant promotion section" },
  newsletter: { title: "Newsletter", desc: "Email signup banner" },
  footer: { title: "Footer", desc: "Footer columns and links" },
  page_shipping: { title: "📄 Shipping Guide", desc: "Static page: shipping info, delivery zones" },
  page_help: { title: "📄 Help Center", desc: "Static page: FAQs and contact cards" },
  page_returns: { title: "📄 Returns", desc: "Static page: return policy, steps, exclusions" },
  page_contact: { title: "📄 Contact Us", desc: "Static page: contact info and form" },
};

const AdminStorefront = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sections, isLoading } = useQuery({
    queryKey: ["storefront-content-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storefront_content")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content, is_active }: { id: string; content: any; is_active: boolean }) => {
      const { error } = await supabase
        .from("storefront_content")
        .update({ content, is_active, updated_at: new Date().toISOString(), updated_by: user?.id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storefront-content-all"] });
      queryClient.invalidateQueries({ queryKey: ["storefront-content"] });
      toast.success("Section updated!");
    },
    onError: () => toast.error("Failed to save"),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading CMS...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Storefront CMS</h1>
        <p className="text-muted-foreground text-sm">Customize every section of your storefront</p>
      </div>

      <Tabs defaultValue={sections?.[0]?.id || "announcement_bar"}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-secondary/50 p-1">
          {sections?.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="text-xs">
              {sectionLabels[s.id]?.title || s.id}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections?.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <SectionEditor
              section={section}
              onSave={(content, is_active) =>
                updateMutation.mutate({ id: section.id, content, is_active })
              }
              saving={updateMutation.isPending}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

function SectionEditor({ section, onSave, saving }: { section: any; onSave: (content: any, is_active: boolean) => void; saving: boolean }) {
  const [content, setContent] = useState(section.content);
  const [isActive, setIsActive] = useState(section.is_active);
  const [showPreview, setShowPreview] = useState(false);
  const meta = sectionLabels[section.id] || { title: section.id, desc: "" };

  const updateField = (path: string, value: any) => {
    setContent((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i]);
        obj = obj[key];
      }
      const lastKey = isNaN(Number(keys[keys.length - 1])) ? keys[keys.length - 1] : Number(keys[keys.length - 1]);
      obj[lastKey] = value;
      return copy;
    });
  };

  const editorMap: Record<string, JSX.Element> = {
    announcement_bar: <AnnouncementEditor content={content} updateField={updateField} />,
    nav_categories: <NavCategoriesEditor content={content} setContent={setContent} />,
    hero_banners: <HeroBannersEditor content={content} setContent={setContent} />,
    trust_badges: <TrustBadgesEditor content={content} setContent={setContent} />,
    flash_deals_section: <TitleSubtitleCountEditor content={content} updateField={updateField} label="Products to Show" />,
    category_showcase: <CategoryEditor content={content} updateField={updateField} setContent={setContent} />,
    condition_showcase: <ConditionEditor content={content} updateField={updateField} setContent={setContent} />,
    featured_products: <TitleSubtitleCountEditor content={content} updateField={updateField} label="Products to Show" />,
    secondary_banners: <SecondaryBannersEditor content={content} setContent={setContent} />,
    new_arrivals: <TitleSubtitleCountEditor content={content} updateField={updateField} label="Products to Show" />,
    brand_showcase: <BrandShowcaseEditor content={content} updateField={updateField} setContent={setContent} />,
    recently_viewed: <TitleSubtitleCountEditor content={content} updateField={updateField} label="Products to Show" />,
    trending_now: <TrendingProductsEditor content={content} updateField={updateField} />,
    deal_of_the_day: <DealOfDayEditor content={content} updateField={updateField} />,
    wholesale: <WholesaleEditor content={content} updateField={updateField} setContent={setContent} />,
    testimonials: <TestimonialsEditor content={content} updateField={updateField} setContent={setContent} />,
    promo_banner: <PromoEditor content={content} updateField={updateField} setContent={setContent} />,
    newsletter: <NewsletterEditor content={content} updateField={updateField} />,
    footer: <FooterEditor content={content} setContent={setContent} />,
    page_shipping: <ShippingPageEditor content={content} updateField={updateField} setContent={setContent} />,
    page_help: <HelpPageEditor content={content} updateField={updateField} setContent={setContent} />,
    page_returns: <ReturnsPageEditor content={content} updateField={updateField} setContent={setContent} />,
    page_contact: <ContactPageEditor content={content} updateField={updateField} />,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{meta.title}</CardTitle>
            <CardDescription>{meta.desc}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Button variant={showPreview ? "default" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Visible" : "Hidden"}</Badge>
            </div>
            <Button onClick={() => onSave(content, isActive)} disabled={saving} size="sm">
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPreview && (
          <div className="rounded-xl border border-primary/20 bg-background p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Live Preview</p>
            <div className="rounded-lg overflow-hidden border border-border">
              <SectionPreview sectionId={section.id} content={content} />
            </div>
          </div>
        )}
        {editorMap[section.id] || <GenericJsonEditor content={content} setContent={setContent} />}
      </CardContent>
    </Card>
  );
}

/* ───── Shared Editors ───── */

function AnnouncementEditor({ content, updateField }: { content: any; updateField: (p: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      <div><label className="text-sm font-medium">Banner Text</label><Input value={content.text || ""} onChange={(e) => updateField("text", e.target.value)} /></div>
      <div><label className="text-sm font-medium">Link URL</label><Input value={content.link || ""} onChange={(e) => updateField("link", e.target.value)} placeholder="/search" /></div>
    </div>
  );
}

function NavCategoriesEditor({ content, setContent }: { content: any; setContent: (c: any) => void }) {
  const links = content.links || [];
  const { getDragProps } = useDragReorder(links, (reordered) => setContent({ ...content, links: reordered }));

  const updateLink = (i: number, field: string, value: any) => {
    const updated = [...links];
    updated[i] = { ...updated[i], [field]: value };
    setContent({ ...content, links: updated });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Manage the navigation bar category links. Toggle "highlight" to make it stand out, set "position: right" to push it to the right side.</p>
      {links.map((link: any, i: number) => {
        const dragProps = getDragProps(i);
        return (
          <div key={i} className={`flex gap-2 items-center ${dragProps.className}`} draggable={dragProps.draggable} onDragStart={dragProps.onDragStart} onDragOver={dragProps.onDragOver} onDrop={dragProps.onDrop} onDragEnd={dragProps.onDragEnd}>
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
            <Input value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="Label" className="flex-1" />
            <Input value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder="URL" className="flex-1" />
            <div className="flex items-center gap-1 shrink-0">
              <Switch checked={link.highlight || false} onCheckedChange={(v) => updateLink(i, "highlight", v)} />
              <span className="text-xs text-muted-foreground">Highlight</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Switch checked={link.position === "right"} onCheckedChange={(v) => updateLink(i, "position", v ? "right" : "")} />
              <span className="text-xs text-muted-foreground">Right</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, links: links.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={() => setContent({ ...content, links: [...links, { label: "New Link", url: "/search" }] })}><Plus className="h-4 w-4 mr-1" /> Add Link</Button>
    </div>
  );
}

function HeroBannersEditor({ content, setContent }: { content: any; setContent: (c: any) => void }) {
  const banners = content.banners || [];
  const { getDragProps } = useDragReorder(banners, (reordered) => setContent({ ...content, banners: reordered }));

  const updateBanner = (index: number, field: string, value: string) => {
    const updated = [...banners];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, banners: updated });
  };

  return (
    <div className="space-y-4">
      {banners.map((banner: any, i: number) => {
        const dragProps = getDragProps(i);
        return (
          <Card key={i} className={`p-4 space-y-3 ${dragProps.className}`} draggable={dragProps.draggable} onDragStart={dragProps.onDragStart} onDragOver={dragProps.onDragOver} onDrop={dragProps.onDrop} onDragEnd={dragProps.onDragEnd}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2 cursor-grab"><GripVertical className="h-4 w-4 text-muted-foreground" />Banner {i + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, banners: banners.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Input value={banner.title} onChange={(e) => updateBanner(i, "title", e.target.value)} placeholder="Title" />
            <Input value={banner.subtitle} onChange={(e) => updateBanner(i, "subtitle", e.target.value)} placeholder="Subtitle" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={banner.cta_text} onChange={(e) => updateBanner(i, "cta_text", e.target.value)} placeholder="Button text" />
              <Input value={banner.cta_link} onChange={(e) => updateBanner(i, "cta_link", e.target.value)} placeholder="Button link" />
            </div>
            <ImageUpload value={banner.image_url} onChange={(url) => updateBanner(i, "image_url", url)} folder="hero" placeholder="Background image URL" />
            <Input value={banner.badge_text} onChange={(e) => updateBanner(i, "badge_text", e.target.value)} placeholder="Badge text" />
          </Card>
        );
      })}
      <Button variant="outline" onClick={() => setContent({ ...content, banners: [...banners, { title: "New Banner", subtitle: "", cta_text: "Shop Now", cta_link: "/search", image_url: "", badge_text: "" }] })} className="w-full"><Plus className="h-4 w-4 mr-2" /> Add Banner</Button>
    </div>
  );
}

function TrustBadgesEditor({ content, setContent }: { content: any; setContent: (c: any) => void }) {
  const badges = content.badges || [];
  const updateBadge = (i: number, field: string, value: string) => { const u = [...badges]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, badges: u }); };
  return (
    <div className="space-y-3">
      {badges.map((badge: any, i: number) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <Input value={badge.title} onChange={(e) => updateBadge(i, "title", e.target.value)} placeholder="Title" />
          <Input value={badge.description} onChange={(e) => updateBadge(i, "description", e.target.value)} placeholder="Description" />
        </div>
      ))}
    </div>
  );
}

function TitleSubtitleCountEditor({ content, updateField, label }: { content: any; updateField: (p: string, v: any) => void; label: string }) {
  return (
    <div className="space-y-3">
      <div><label className="text-sm font-medium">Section Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
      <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      <div><label className="text-sm font-medium">{label}</label><Input type="number" value={content.show_count || 8} onChange={(e) => updateField("show_count", parseInt(e.target.value) || 8)} min={4} max={24} /></div>
    </div>
  );
}

function CategoryEditor({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: (c: any) => void }) {
  const categories = content.categories || [];
  const { getDragProps } = useDragReorder(categories, (reordered) => setContent({ ...content, categories: reordered }));

  const updateCategory = (i: number, field: string, value: string) => { const u = [...categories]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, categories: u }); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Section Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      </div>
      <p className="text-sm font-medium">Categories</p>
      {categories.map((cat: any, i: number) => {
        const dragProps = getDragProps(i);
        return (
          <div key={i} className={`flex gap-2 items-start ${dragProps.className}`} draggable={dragProps.draggable} onDragStart={dragProps.onDragStart} onDragOver={dragProps.onDragOver} onDrop={dragProps.onDrop} onDragEnd={dragProps.onDragEnd}>
            <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 cursor-grab shrink-0" />
            <Input value={cat.name} onChange={(e) => updateCategory(i, "name", e.target.value)} placeholder="Name" className="flex-1" />
            <Input value={cat.icon} onChange={(e) => updateCategory(i, "icon", e.target.value)} placeholder="Icon" className="w-28" />
            <Input value={cat.link} onChange={(e) => updateCategory(i, "link", e.target.value)} placeholder="Link" className="flex-1" />
            <ImageUpload value={cat.image_url || ""} onChange={(url) => updateCategory(i, "image_url", url)} folder="categories" placeholder="Icon image" className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, categories: categories.filter((_: any, j: number) => j !== i) })} className="text-destructive shrink-0 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
          </div>
        );
      })}
      <Button variant="outline" onClick={() => setContent({ ...content, categories: [...categories, { name: "New", icon: "smartphone", link: "/search" }] })} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
    </div>
  );
}

function ConditionEditor({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: (c: any) => void }) {
  const cards = content.cards || [];
  const updateCard = (i: number, field: string, value: string) => { const u = [...cards]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, cards: u }); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Section Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      </div>
      {cards.map((card: any, i: number) => (
        <Card key={i} className="p-4 space-y-2">
          <div className="flex items-center justify-between"><span className="text-sm font-medium">Card {i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, cards: cards.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={card.title} onChange={(e) => updateCard(i, "title", e.target.value)} placeholder="Title" />
            <Input value={card.description} onChange={(e) => updateCard(i, "description", e.target.value)} placeholder="Description" />
            <Input value={card.icon} onChange={(e) => updateCard(i, "icon", e.target.value)} placeholder="Icon (sparkles/thumbs-up/refresh/shield)" />
            <Input value={card.link} onChange={(e) => updateCard(i, "link", e.target.value)} placeholder="Link" />
          </div>
        </Card>
      ))}
      <Button variant="outline" size="sm" onClick={() => setContent({ ...content, cards: [...cards, { title: "New", description: "", icon: "shield", link: "/search", color: "primary" }] })}><Plus className="h-4 w-4 mr-1" /> Add Card</Button>
    </div>
  );
}

function SecondaryBannersEditor({ content, setContent }: { content: any; setContent: (c: any) => void }) {
  const banners = content.banners || [];
  const updateBanner = (i: number, field: string, value: string) => { const u = [...banners]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, banners: u }); };

  return (
    <div className="space-y-4">
      {banners.map((b: any, i: number) => (
        <Card key={i} className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Banner {i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, banners: banners.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
          </div>
          <Input value={b.title} onChange={(e) => updateBanner(i, "title", e.target.value)} placeholder="Title" />
          <Input value={b.subtitle} onChange={(e) => updateBanner(i, "subtitle", e.target.value)} placeholder="Subtitle" />
          <Input value={b.link} onChange={(e) => updateBanner(i, "link", e.target.value)} placeholder="Link URL" />
          <ImageUpload value={b.image_url || ""} onChange={(url) => updateBanner(i, "image_url", url)} folder="banners" placeholder="Banner image" />
        </Card>
      ))}
      <Button variant="outline" onClick={() => setContent({ ...content, banners: [...banners, { title: "New Banner", subtitle: "", image_url: "", link: "/search" }] })} className="w-full"><Plus className="h-4 w-4 mr-2" /> Add Banner</Button>
    </div>
  );
}

function BrandShowcaseEditor({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: (c: any) => void }) {
  const brands = content.brands || [];
  const { getDragProps } = useDragReorder(brands, (reordered) => setContent({ ...content, brands: reordered }));
  const updateBrand = (i: number, field: string, value: string) => { const u = [...brands]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, brands: u }); };

  return (
    <div className="space-y-4">
      <div><label className="text-sm font-medium">Section Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
      {brands.map((brand: any, i: number) => {
        const dragProps = getDragProps(i);
        return (
          <div key={i} className={`flex gap-2 items-center ${dragProps.className}`} draggable={dragProps.draggable} onDragStart={dragProps.onDragStart} onDragOver={dragProps.onDragOver} onDrop={dragProps.onDrop} onDragEnd={dragProps.onDragEnd}>
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
            <Input value={brand.name} onChange={(e) => updateBrand(i, "name", e.target.value)} placeholder="Brand name" className="flex-1" />
            <Input value={brand.link} onChange={(e) => updateBrand(i, "link", e.target.value)} placeholder="Link" className="flex-1" />
            <ImageUpload value={brand.logo_url || ""} onChange={(url) => updateBrand(i, "logo_url", url)} folder="brands" placeholder="Logo" className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, brands: brands.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={() => setContent({ ...content, brands: [...brands, { name: "New Brand", logo_url: "", link: "/search" }] })}><Plus className="h-4 w-4 mr-1" /> Add Brand</Button>
    </div>
  );
}

function TestimonialsEditor({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: (c: any) => void }) {
  const testimonials = content.testimonials || [];
  const updateTestimonial = (i: number, field: string, value: any) => { const u = [...testimonials]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, testimonials: u }); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Section Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      </div>
      {testimonials.map((t: any, i: number) => (
        <Card key={i} className="p-4 space-y-2">
          <div className="flex items-center justify-between"><span className="text-sm font-medium">Review {i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, testimonials: testimonials.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input value={t.name} onChange={(e) => updateTestimonial(i, "name", e.target.value)} placeholder="Name" />
            <Input value={t.location} onChange={(e) => updateTestimonial(i, "location", e.target.value)} placeholder="Location" />
            <Input type="number" value={t.rating} onChange={(e) => updateTestimonial(i, "rating", parseInt(e.target.value) || 5)} min={1} max={5} placeholder="Rating" />
          </div>
          <Textarea value={t.text} onChange={(e) => updateTestimonial(i, "text", e.target.value)} placeholder="Review text" rows={2} />
        </Card>
      ))}
      <Button variant="outline" size="sm" onClick={() => setContent({ ...content, testimonials: [...testimonials, { name: "Customer", location: "Dubai", text: "", rating: 5 }] })}><Plus className="h-4 w-4 mr-1" /> Add Review</Button>
    </div>
  );
}

function PromoEditor({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: (c: any) => void }) {
  const suggestions = content.suggestions || [];
  return (
    <div className="space-y-3">
      <div><label className="text-sm font-medium">Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
      <div><label className="text-sm font-medium">Subtitle</label><Textarea value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Button Text</label><Input value={content.cta_text || ""} onChange={(e) => updateField("cta_text", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Button Link</label><Input value={content.cta_link || ""} onChange={(e) => updateField("cta_link", e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-medium">Sample Questions (one per line)</label>
        <Textarea value={suggestions.join("\n")} onChange={(e) => setContent({ ...content, suggestions: e.target.value.split("\n").filter(Boolean) })} rows={3} />
      </div>
    </div>
  );
}

function NewsletterEditor({ content, updateField }: { content: any; updateField: (p: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      <div><label className="text-sm font-medium">Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
      <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      <div><label className="text-sm font-medium">Button Text</label><Input value={content.cta_text || ""} onChange={(e) => updateField("cta_text", e.target.value)} /></div>
    </div>
  );
}

function DealOfDayEditor({ content, updateField }: { content: any; updateField: (p: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      <div><label className="text-sm font-medium">Section Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
      <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      <div><label className="text-sm font-medium">Product ID (leave blank to auto-pick highest discount)</label><Input value={content.product_id || ""} onChange={(e) => updateField("product_id", e.target.value)} placeholder="UUID or leave empty" /></div>
      <div><label className="text-sm font-medium">Countdown End Time (ISO)</label><Input type="datetime-local" value={content.end_time ? content.end_time.slice(0, 16) : ""} onChange={(e) => updateField("end_time", e.target.value ? new Date(e.target.value).toISOString() : "")} /></div>
      <div><label className="text-sm font-medium">Badge Text</label><Input value={content.badge_text || ""} onChange={(e) => updateField("badge_text", e.target.value)} placeholder="LIMITED TIME" /></div>
    </div>
  );
}

function WholesaleEditor({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: (c: any) => void }) {
  const tiers = content.pricing_tiers || [];
  const perks = content.perks || [];
  const stats = content.stats || [];

  const updateTier = (i: number, field: string, value: any) => { const u = [...tiers]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, pricing_tiers: u }); };
  const updatePerk = (i: number, field: string, value: any) => { const u = [...perks]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, perks: u }); };
  const updateStat = (i: number, field: string, value: any) => { const u = [...stats]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, stats: u }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Section Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-medium">Description</label><Textarea value={content.description || ""} onChange={(e) => updateField("description", e.target.value)} rows={2} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Email</label><Input value={content.email || ""} onChange={(e) => updateField("email", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Phone</label><Input value={content.phone || ""} onChange={(e) => updateField("phone", e.target.value)} /></div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">Pricing Tiers</p>
        {tiers.map((tier: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input value={tier.label} onChange={(e) => updateTier(i, "label", e.target.value)} placeholder="Label" className="w-28" />
            <Input type="number" value={tier.min_qty} onChange={(e) => updateTier(i, "min_qty", parseInt(e.target.value) || 0)} placeholder="Min" className="w-20" />
            <Input type="number" value={tier.max_qty || ""} onChange={(e) => updateTier(i, "max_qty", e.target.value ? parseInt(e.target.value) : null)} placeholder="Max" className="w-20" />
            <Input value={tier.discount} onChange={(e) => updateTier(i, "discount", e.target.value)} placeholder="Discount" className="w-20" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, pricing_tiers: tiers.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, pricing_tiers: [...tiers, { label: "New", min_qty: 0, max_qty: null, discount: "5%" }] })}><Plus className="h-4 w-4 mr-1" /> Add Tier</Button>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">Perks</p>
        {perks.map((perk: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input value={perk.title} onChange={(e) => updatePerk(i, "title", e.target.value)} placeholder="Title" className="flex-1" />
            <Input value={perk.desc} onChange={(e) => updatePerk(i, "desc", e.target.value)} placeholder="Description" className="flex-1" />
            <Input value={perk.icon} onChange={(e) => updatePerk(i, "icon", e.target.value)} placeholder="Icon" className="w-28" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, perks: perks.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, perks: [...perks, { title: "New Perk", desc: "", icon: "shield" }] })}><Plus className="h-4 w-4 mr-1" /> Add Perk</Button>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">Stats</p>
        {stats.map((stat: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="Value" className="w-28" />
            <Input value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Label" className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, stats: stats.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, stats: [...stats, { value: "0", label: "New Stat" }] })}><Plus className="h-4 w-4 mr-1" /> Add Stat</Button>
      </div>
    </div>
  );
}

function FooterEditor({ content, setContent }: { content: any; setContent: (c: any) => void }) {
  const columns = content.columns || [];
  const updateLink = (colIdx: number, linkIdx: number, field: string, value: string) => {
    const updated = JSON.parse(JSON.stringify(columns));
    updated[colIdx].links[linkIdx][field] = value;
    setContent({ ...content, columns: updated });
  };
  const addLink = (colIdx: number) => { const u = JSON.parse(JSON.stringify(columns)); u[colIdx].links.push({ label: "New Link", url: "#" }); setContent({ ...content, columns: u }); };
  const removeLink = (colIdx: number, linkIdx: number) => { const u = JSON.parse(JSON.stringify(columns)); u[colIdx].links.splice(linkIdx, 1); setContent({ ...content, columns: u }); };

  return (
    <div className="space-y-6">
      {columns.map((col: any, colIdx: number) => (
        <div key={colIdx} className="space-y-2">
          <Input value={col.title} onChange={(e) => { const u = JSON.parse(JSON.stringify(columns)); u[colIdx].title = e.target.value; setContent({ ...content, columns: u }); }} className="font-semibold" placeholder="Column title" />
          {col.links.map((link: any, linkIdx: number) => (
            <div key={linkIdx} className="flex gap-2 items-center pl-4">
              <Input value={link.label} onChange={(e) => updateLink(colIdx, linkIdx, "label", e.target.value)} placeholder="Label" className="flex-1" />
              <Input value={link.url} onChange={(e) => updateLink(colIdx, linkIdx, "url", e.target.value)} placeholder="URL" className="flex-1" />
              <Button variant="ghost" size="icon" onClick={() => removeLink(colIdx, linkIdx)} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addLink(colIdx)} className="ml-4"><Plus className="h-3 w-3 mr-1" /> Add Link</Button>
        </div>
      ))}
    </div>
  );
}

function GenericJsonEditor({ content, setContent }: { content: any; setContent: (c: any) => void }) {
  const [json, setJson] = useState(JSON.stringify(content, null, 2));
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Edit raw JSON content:</p>
      <Textarea value={json} onChange={(e) => { setJson(e.target.value); try { setContent(JSON.parse(e.target.value)); } catch {} }} rows={10} className="font-mono text-xs" />
    </div>
  );
}

/* ───── Static Page Editors ───── */

function ShippingPageEditor({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: (c: any) => void }) {
  const sections = content.sections || [];
  const zones = content.delivery_zones || [];
  const updateSection = (i: number, field: string, value: any) => { const u = [...sections]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, sections: u }); };
  const updateZone = (i: number, field: string, value: any) => { const u = [...zones]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, delivery_zones: u }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Page Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">Info Sections</p>
        {sections.map((s: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input value={s.heading} onChange={(e) => updateSection(i, "heading", e.target.value)} placeholder="Heading" className="flex-1" />
            <Input value={s.body} onChange={(e) => updateSection(i, "body", e.target.value)} placeholder="Body" className="flex-[2]" />
            <Input value={s.icon || ""} onChange={(e) => updateSection(i, "icon", e.target.value)} placeholder="Icon" className="w-24" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, sections: sections.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, sections: [...sections, { heading: "", body: "", icon: "truck" }] })}><Plus className="h-4 w-4 mr-1" /> Add Section</Button>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">Delivery Zones</p>
        {zones.map((z: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input value={z.zone} onChange={(e) => updateZone(i, "zone", e.target.value)} placeholder="Zone" className="flex-1" />
            <Input value={z.time} onChange={(e) => updateZone(i, "time", e.target.value)} placeholder="Time" className="flex-1" />
            <Input value={z.cost} onChange={(e) => updateZone(i, "cost", e.target.value)} placeholder="Cost" className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, delivery_zones: zones.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, delivery_zones: [...zones, { zone: "", time: "", cost: "" }] })}><Plus className="h-4 w-4 mr-1" /> Add Zone</Button>
      </div>
    </div>
  );
}

function HelpPageEditor({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: (c: any) => void }) {
  const faqs = content.faqs || [];
  const cards = content.contact_cards || [];
  const updateFaq = (i: number, field: string, value: any) => { const u = [...faqs]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, faqs: u }); };
  const updateCard = (i: number, field: string, value: any) => { const u = [...cards]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, contact_cards: u }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Page Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">FAQs</p>
        {faqs.map((faq: any, i: number) => (
          <Card key={i} className="p-3 mb-2 space-y-2">
            <Input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Question" />
            <Textarea value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Answer" rows={2} />
            <Button variant="ghost" size="sm" onClick={() => setContent({ ...content, faqs: faqs.filter((_: any, j: number) => j !== i) })} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
          </Card>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, faqs: [...faqs, { question: "", answer: "" }] })}><Plus className="h-4 w-4 mr-1" /> Add FAQ</Button>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">Contact Cards</p>
        {cards.map((c: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input value={c.title} onChange={(e) => updateCard(i, "title", e.target.value)} placeholder="Title" className="flex-1" />
            <Input value={c.description} onChange={(e) => updateCard(i, "description", e.target.value)} placeholder="Description" className="flex-1" />
            <Input value={c.icon} onChange={(e) => updateCard(i, "icon", e.target.value)} placeholder="Icon" className="w-24" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, contact_cards: cards.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, contact_cards: [...cards, { title: "", description: "", icon: "help" }] })}><Plus className="h-4 w-4 mr-1" /> Add Card</Button>
      </div>
    </div>
  );
}

function ReturnsPageEditor({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: (c: any) => void }) {
  const policySections = content.policy_sections || [];
  const steps = content.steps || [];
  const nonReturnable = content.non_returnable || [];
  const updatePolicy = (i: number, field: string, value: any) => { const u = [...policySections]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, policy_sections: u }); };
  const updateStep = (i: number, field: string, value: any) => { const u = [...steps]; u[i] = { ...u[i], [field]: value }; setContent({ ...content, steps: u }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Page Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">Policy Sections</p>
        {policySections.map((s: any, i: number) => (
          <div key={i} className="flex gap-2 items-start mb-2">
            <Input value={s.heading} onChange={(e) => updatePolicy(i, "heading", e.target.value)} placeholder="Heading" className="w-48" />
            <Textarea value={s.body} onChange={(e) => updatePolicy(i, "body", e.target.value)} placeholder="Body" rows={2} className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, policy_sections: policySections.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0 mt-1"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, policy_sections: [...policySections, { heading: "", body: "" }] })}><Plus className="h-4 w-4 mr-1" /> Add Section</Button>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">Return Steps</p>
        {steps.map((s: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input value={s.step} onChange={(e) => updateStep(i, "step", e.target.value)} placeholder="#" className="w-16" />
            <Input value={s.description} onChange={(e) => updateStep(i, "description", e.target.value)} placeholder="Description" className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, steps: steps.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, steps: [...steps, { step: String(steps.length + 1), description: "" }] })}><Plus className="h-4 w-4 mr-1" /> Add Step</Button>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-2">Non-Returnable Items</p>
        {nonReturnable.map((item: string, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input value={item} onChange={(e) => { const u = [...nonReturnable]; u[i] = e.target.value; setContent({ ...content, non_returnable: u }); }} className="flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setContent({ ...content, non_returnable: nonReturnable.filter((_: any, j: number) => j !== i) })} className="text-destructive h-8 w-8 shrink-0"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setContent({ ...content, non_returnable: [...nonReturnable, ""] })}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
      </div>
    </div>
  );
}

function ContactPageEditor({ content, updateField }: { content: any; updateField: (p: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Page Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-medium">Address</label><Input value={content.address || ""} onChange={(e) => updateField("address", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Phone</label><Input value={content.phone || ""} onChange={(e) => updateField("phone", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Email</label><Input value={content.email || ""} onChange={(e) => updateField("email", e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-medium">Working Hours</label><Input value={content.hours || ""} onChange={(e) => updateField("hours", e.target.value)} /></div>
    </div>
  );
}

function TrendingProductsEditor({ content, updateField }: { content: any; updateField: (p: string, v: any) => void }) {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState("");

  const { data: trendingItems, refetch } = useQuery({
    queryKey: ["admin-trending-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending_products" as any)
        .select("*, products(id, name, brand, price, slug)")
        .order("display_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: allProducts } = useQuery({
    queryKey: ["admin-all-products-for-trending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const addProduct = async () => {
    if (!selectedProductId) return;
    const nextOrder = (trendingItems?.length || 0);
    const { error } = await supabase
      .from("trending_products" as any)
      .insert({ product_id: selectedProductId, display_order: nextOrder } as any);
    if (error) {
      if (error.code === "23505") toast.error("Product already in trending");
      else toast.error("Failed to add");
      return;
    }
    toast.success("Product added to trending");
    setSelectedProductId("");
    refetch();
    queryClient.invalidateQueries({ queryKey: ["trending-products-curated"] });
  };

  const removeProduct = async (id: string) => {
    const { error } = await supabase.from("trending_products" as any).delete().eq("id", id);
    if (error) { toast.error("Failed to remove"); return; }
    toast.success("Removed from trending");
    refetch();
    queryClient.invalidateQueries({ queryKey: ["trending-products-curated"] });
  };

  const usedIds = new Set((trendingItems || []).map((t: any) => t.product_id));
  const availableProducts = (allProducts || []).filter((p) => !usedIds.has(p.id));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Section Title</label><Input value={content.title || ""} onChange={(e) => updateField("title", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Subtitle</label><Input value={content.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} /></div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold mb-3">Curated Trending Products</h3>

        {/* Add product */}
        <div className="flex gap-2 mb-4">
          <select
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select a product to add...</option>
            {availableProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.brand} (AED {p.price})</option>
            ))}
          </select>
          <Button onClick={addProduct} disabled={!selectedProductId} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {(trendingItems || []).map((item: any, i: number) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                <div>
                  <p className="text-sm font-medium">{item.products?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{item.products?.brand} · AED {item.products?.price}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeProduct(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(!trendingItems || trendingItems.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No trending products added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminStorefront;
