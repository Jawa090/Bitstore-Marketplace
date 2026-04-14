import { Suspense, lazy, ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function lazySection<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  const Comp = lazy(factory);
  return (props: any) => (
    <Suspense fallback={<div className="py-12"><div className="container"><Skeleton className="h-64 w-full rounded-xl" /></div></div>}>
      <Comp {...props} />
    </Suspense>
  );
}

export const LazyFlashDeals = lazySection(() => import("./StorefrontFlashDeals"));
export const LazyConditions = lazySection(() => import("./StorefrontConditions"));
export const LazySecondaryBanners = lazySection(() => import("./StorefrontSecondaryBanners"));
export const LazyNewArrivals = lazySection(() => import("./StorefrontNewArrivals"));
export const LazyBrands = lazySection(() => import("./StorefrontBrands"));
export const LazyCollections = lazySection(() => import("./StorefrontCollections"));
export const LazyTestimonials = lazySection(() => import("./StorefrontTestimonials"));
export const LazyPromoBanner = lazySection(() => import("./StorefrontPromoBanner"));
export const LazyNewsletter = lazySection(() => import("./StorefrontNewsletter"));
export const LazyRecentlyViewed = lazySection(() => import("./StorefrontRecentlyViewed"));
export const LazyScheduledBanners = lazySection(() => import("./StorefrontScheduledBanners"));
export const LazyTrending = lazySection(() => import("./StorefrontTrending"));
export const LazyDealOfDay = lazySection(() => import("./StorefrontDealOfDay"));
export const LazyAuctions = lazySection(() => import("./StorefrontAuctions"));
export const LazyWholesale = lazySection(() => import("./StorefrontWholesale"));
export const LazyPromoBannerGrid = lazySection(() => import("./StorefrontPromoBannerGrid"));
export const LazyBusinessModels = lazySection(() => import("./StorefrontBusinessModels"));
