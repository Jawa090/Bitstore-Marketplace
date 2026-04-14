import Navbar from "@/components/Navbar";
import StorefrontHero from "@/components/storefront/StorefrontHero";
import StorefrontTrustBar from "@/components/storefront/StorefrontTrustBar";
import StorefrontCategories from "@/components/storefront/StorefrontCategories";
import StorefrontFeatured from "@/components/storefront/StorefrontFeatured";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import BackToTop from "@/components/storefront/BackToTop";
import {
  LazyNewArrivals,
  LazyCollections,
  LazyTestimonials,
  LazyScheduledBanners,
  LazyTrending,
  LazyBrands,
  LazyAuctions,
  LazyPromoBannerGrid,
  LazyBusinessModels,
} from "@/components/storefront/LazySections";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <StorefrontHero />
    <StorefrontTrustBar />
    <StorefrontCategories />
    <LazyPromoBannerGrid />
    <StorefrontFeatured />
    <LazyBrands />
    <LazyNewArrivals />
    <LazyTrending />
    <LazyBusinessModels />
    <LazyAuctions />
    <LazyScheduledBanners />
    <LazyCollections />
    <LazyTestimonials />
    <StorefrontFooter />
    <BackToTop />
  </div>
);

export default Index;
