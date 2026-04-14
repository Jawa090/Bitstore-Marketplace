const STORAGE_KEY = "bitstores_recently_viewed";
const MAX_ITEMS = 20;

export interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  image: string;
  vendor: string;
  ram?: string;
  storage?: string;
  camera?: string;
  viewedAt: number;
}

export function getRecentlyViewed(): RecentProduct[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function trackProductView(product: Omit<RecentProduct, "viewedAt">) {
  const items = getRecentlyViewed().filter((p) => p.id !== product.id);
  items.unshift({ ...product, viewedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}
