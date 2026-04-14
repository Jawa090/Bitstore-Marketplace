import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Star, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/product/ImageGallery";
import SpecsTable from "@/components/product/SpecsTable";
import VendorInfo from "@/components/product/VendorInfo";
import AddToCart from "@/components/product/AddToCart";
import WhatsIncluded from "@/components/product/WhatsIncluded";
import ProductFAQ from "@/components/product/ProductFAQ";
import ProtectionPlan from "@/components/product/ProtectionPlan";
import RelatedProducts from "@/components/product/RelatedProducts";
import VariantSelector from "@/components/product/VariantSelector";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackProductView } from "@/lib/recentlyViewed";
import { toast } from "@/hooks/use-toast";
import { getProductBySlug } from "@/data/mockData";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;

  useEffect(() => {
    if (!product) return;
    const primaryImg = product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url || "/placeholder.svg";
    trackProductView({
      id: product.id, slug: product.slug, name: product.name, brand: product.brand,
      price: product.price, original_price: product.original_price || undefined,
      image: primaryImg, vendor: product.vendor?.store_name || "BitStores",
      ram: product.ram || undefined, storage: product.storage || undefined, camera: product.camera || undefined,
    });
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images.sort((a, b) => a.display_order - b.display_order).map((img) => img.image_url)
    : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"];

  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;
  const conditionLabel = product.condition?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-20 pb-16">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/search" className="hover:text-foreground transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/search?brand=${product.brand}`} className="hover:text-foreground transition-colors">{product.brand}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="relative">
                {discount > 0 && <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground border-0 text-xs px-2.5 py-1 font-bold">-{discount}%</Badge>}
                {product.condition && product.condition !== "new" && <Badge variant="secondary" className="absolute top-3 right-3 z-10 text-xs capitalize">{conditionLabel}</Badge>}
                <ImageGallery images={images} productName={product.name} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-4 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Link to={`/search?brand=${product.brand}`} className="text-xs font-semibold text-primary hover:underline">{product.brand}</Link>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold leading-tight text-foreground">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= 4 ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />)}
                  <span className="text-xs text-muted-foreground ml-1">4.5 (128)</span>
                </div>
                <span className="text-border">|</span>
                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied!" }); }}>
                  <Share2 className="h-3 w-3" /> Share
                </button>
              </div>
            </div>

            <div className="lg:hidden">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{product.currency} {product.price.toLocaleString()}</span>
                {product.original_price && <span className="text-sm text-muted-foreground line-through">{product.currency} {product.original_price.toLocaleString()}</span>}
                {discount > 0 && <span className="text-sm font-semibold text-primary">-{discount}%</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {product.storage && <span className="px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/5 text-xs font-semibold text-primary">{product.storage}</span>}
              {product.ram && <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground">{product.ram} RAM</span>}
              {product.color && <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground">{product.color}</span>}
              {product.battery && <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground">{product.battery}</span>}
              {product.warranty_months && <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground">{product.warranty_months}M Warranty</span>}
            </div>

            <VariantSelector currentProductId={product.id} brand={product.brand} name={product.name} currentStorage={product.storage} currentColor={product.color} currentCondition={product.condition} />
            <ProtectionPlan price={product.price} currency={product.currency} />

            {product.vendor && (
              <VendorInfo vendor={{ store_name: product.vendor.store_name, logo_url: product.vendor.logo_url, emirate: product.vendor.emirate, is_bitstores: product.vendor.is_bitstores }} />
            )}

            {product.description && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Highlights</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  {product.description.split(/[.\n]/).filter(Boolean).slice(0, 5).map((line, i) => (
                    <li key={i} className="flex gap-2"><span className="text-primary mt-1">•</span><span>{line.trim()}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-4">
              <AddToCart productId={product.id} price={product.price} originalPrice={product.original_price} currency={product.currency}
                stock={product.stock_quantity} productName={product.name} imageUrl={images[0]} vendorId={product.vendor_id}
                vendorName={product.vendor?.store_name ?? "Unknown"} slug={product.slug}
              />
            </div>
          </motion.div>
        </div>

        <Separator className="my-10" />

        <Tabs defaultValue="specs" className="w-full">
          <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-auto p-0 gap-0">
            <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium">Specifications</TabsTrigger>
            <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium">Description</TabsTrigger>
            <TabsTrigger value="included" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium">What's Included</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium">FAQ</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="mt-6"><div className="max-w-2xl"><SpecsTable specs={{ ram: product.ram, storage: product.storage, camera: product.camera, battery: product.battery, display_size: product.display_size, processor: product.processor, os: product.os, warranty_months: product.warranty_months, color: product.color, condition: product.condition }} /></div></TabsContent>
          <TabsContent value="description" className="mt-6"><div className="max-w-2xl">{product.description ? <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p> : <p className="text-sm text-muted-foreground">No description available.</p>}</div></TabsContent>
          <TabsContent value="included" className="mt-6"><div className="max-w-2xl"><WhatsIncluded /></div></TabsContent>
          <TabsContent value="faq" className="mt-6"><div className="max-w-2xl"><ProductFAQ /></div></TabsContent>
        </Tabs>

        <Separator className="my-10" />
        <RelatedProducts currentProductId={product.id} brand={product.brand} />
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
