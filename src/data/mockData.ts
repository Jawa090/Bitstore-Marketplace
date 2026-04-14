// Mock data for standalone frontend (no Supabase)

export interface MockProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: number;
  original_price: number | null;
  currency: string;
  condition: string;
  is_active: boolean;
  stock_quantity: number;
  ram: string | null;
  storage: string | null;
  camera: string | null;
  battery: string | null;
  display_size: string | null;
  processor: string | null;
  os: string | null;
  color: string | null;
  warranty_months: number | null;
  description: string | null;
  vendor_id: string;
  created_at: string;
  images: { image_url: string; is_primary: boolean; display_order: number }[];
  vendor: { store_name: string; logo_url: string | null; emirate: string; is_bitstores: boolean };
}

const vendorBitStores = { store_name: "BitStores", logo_url: null, emirate: "Dubai", is_bitstores: true };
const vendorTechZone = { store_name: "TechZone UAE", logo_url: null, emirate: "Sharjah", is_bitstores: false };
const vendorMobileHub = { store_name: "Mobile Hub", logo_url: null, emirate: "Abu Dhabi", is_bitstores: false };

export const mockProducts: MockProduct[] = [
  {
    id: "1", name: "iPhone 15 Pro Max 256GB Natural Titanium", brand: "Apple", slug: "iphone-15-pro-max-256gb-natural-titanium",
    price: 3899, original_price: 5499, currency: "AED", condition: "used_like_new", is_active: true, stock_quantity: 12,
    ram: "8GB", storage: "256GB", camera: "48MP", battery: "4422 mAh", display_size: "6.7\"", processor: "A17 Pro", os: "iOS 17", color: "Natural Titanium", warranty_months: 12,
    description: "Apple iPhone 15 Pro Max in excellent condition. All features working perfectly. Comes with original box and accessories.", vendor_id: "v1",
    created_at: "2024-12-01T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorBitStores,
  },
  {
    id: "2", name: "Samsung Galaxy S24 Ultra 512GB Titanium Black", brand: "Samsung", slug: "samsung-galaxy-s24-ultra-512gb",
    price: 3499, original_price: 4999, currency: "AED", condition: "new", is_active: true, stock_quantity: 8,
    ram: "12GB", storage: "512GB", camera: "200MP", battery: "5000 mAh", display_size: "6.8\"", processor: "Snapdragon 8 Gen 3", os: "Android 14", color: "Titanium Black", warranty_months: 24,
    description: "Brand new Samsung Galaxy S24 Ultra with S Pen. Official UAE warranty.", vendor_id: "v2",
    created_at: "2024-12-05T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorTechZone,
  },
  {
    id: "3", name: "MacBook Air M2 256GB Space Gray", brand: "Apple", slug: "macbook-air-m2-256gb-space-gray",
    price: 2999, original_price: 4499, currency: "AED", condition: "refurbished", is_active: true, stock_quantity: 5,
    ram: "8GB", storage: "256GB", camera: "1080p FaceTime", battery: "18 hours", display_size: "13.6\"", processor: "Apple M2", os: "macOS Sonoma", color: "Space Gray", warranty_months: 12,
    description: "Certified refurbished MacBook Air M2. Like new condition with 12 month warranty.", vendor_id: "v1",
    created_at: "2024-11-20T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorBitStores,
  },
  {
    id: "4", name: "iPad Pro 12.9\" M2 128GB WiFi", brand: "Apple", slug: "ipad-pro-129-m2-128gb",
    price: 2799, original_price: 3999, currency: "AED", condition: "used_like_new", is_active: true, stock_quantity: 3,
    ram: "8GB", storage: "128GB", camera: "12MP Wide", battery: "10 hours", display_size: "12.9\"", processor: "Apple M2", os: "iPadOS 17", color: "Space Gray", warranty_months: 6,
    description: "iPad Pro 12.9 M2 chip. Perfect for creative professionals.", vendor_id: "v3",
    created_at: "2024-12-10T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorMobileHub,
  },
  {
    id: "5", name: "Google Pixel 8 Pro 256GB Obsidian", brand: "Google", slug: "google-pixel-8-pro-256gb",
    price: 2199, original_price: 3299, currency: "AED", condition: "new", is_active: true, stock_quantity: 15,
    ram: "12GB", storage: "256GB", camera: "50MP", battery: "5050 mAh", display_size: "6.7\"", processor: "Tensor G3", os: "Android 14", color: "Obsidian", warranty_months: 24,
    description: "Google Pixel 8 Pro with AI-powered camera and 7 years of updates.", vendor_id: "v2",
    created_at: "2024-12-08T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorTechZone,
  },
  {
    id: "6", name: "AirPods Pro 2nd Generation USB-C", brand: "Apple", slug: "airpods-pro-2-usbc",
    price: 699, original_price: 949, currency: "AED", condition: "new", is_active: true, stock_quantity: 25,
    ram: null, storage: null, camera: null, battery: "6 hours", display_size: null, processor: "H2 Chip", os: null, color: "White", warranty_months: 12,
    description: "AirPods Pro 2nd gen with USB-C. Active Noise Cancellation.", vendor_id: "v1",
    created_at: "2024-12-12T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorBitStores,
  },
  {
    id: "7", name: "Apple Watch Ultra 2 49mm Titanium", brand: "Apple", slug: "apple-watch-ultra-2",
    price: 2899, original_price: 3699, currency: "AED", condition: "used_good", is_active: true, stock_quantity: 4,
    ram: null, storage: "64GB", camera: null, battery: "36 hours", display_size: "49mm", processor: "S9 SiP", os: "watchOS 10", color: "Titanium", warranty_months: 6,
    description: "Apple Watch Ultra 2 in good condition with minor cosmetic wear.", vendor_id: "v3",
    created_at: "2024-11-15T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorMobileHub,
  },
  {
    id: "8", name: "Samsung Galaxy Z Fold5 256GB Phantom Black", brand: "Samsung", slug: "samsung-galaxy-z-fold5-256gb",
    price: 4299, original_price: 6799, currency: "AED", condition: "used_like_new", is_active: true, stock_quantity: 2,
    ram: "12GB", storage: "256GB", camera: "50MP", battery: "4400 mAh", display_size: "7.6\"", processor: "Snapdragon 8 Gen 2", os: "Android 14", color: "Phantom Black", warranty_months: 12,
    description: "Samsung Galaxy Z Fold5, barely used. Includes original accessories.", vendor_id: "v2",
    created_at: "2024-12-03T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorTechZone,
  },
  {
    id: "9", name: "Sony WH-1000XM5 Wireless Headphones", brand: "Sony", slug: "sony-wh-1000xm5",
    price: 899, original_price: 1499, currency: "AED", condition: "new", is_active: true, stock_quantity: 20,
    ram: null, storage: null, camera: null, battery: "30 hours", display_size: null, processor: null, os: null, color: "Black", warranty_months: 24,
    description: "Industry-leading noise cancellation headphones from Sony.", vendor_id: "v1",
    created_at: "2024-12-07T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorBitStores,
  },
  {
    id: "10", name: "iPhone 14 128GB Blue", brand: "Apple", slug: "iphone-14-128gb-blue",
    price: 1899, original_price: 3299, currency: "AED", condition: "refurbished", is_active: true, stock_quantity: 10,
    ram: "6GB", storage: "128GB", camera: "12MP", battery: "3279 mAh", display_size: "6.1\"", processor: "A15 Bionic", os: "iOS 17", color: "Blue", warranty_months: 12,
    description: "Certified refurbished iPhone 14 with full warranty. Looks and works like new.", vendor_id: "v1",
    created_at: "2024-11-25T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorBitStores,
  },
  {
    id: "11", name: "OnePlus 12 16GB 512GB Flowy Emerald", brand: "OnePlus", slug: "oneplus-12-512gb",
    price: 2499, original_price: 3199, currency: "AED", condition: "new", is_active: true, stock_quantity: 7,
    ram: "16GB", storage: "512GB", camera: "50MP", battery: "5400 mAh", display_size: "6.82\"", processor: "Snapdragon 8 Gen 3", os: "Android 14", color: "Flowy Emerald", warranty_months: 24,
    description: "OnePlus 12 flagship with Hasselblad camera system.", vendor_id: "v2",
    created_at: "2024-12-09T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorTechZone,
  },
  {
    id: "12", name: "Dell XPS 15 i7 16GB 512GB", brand: "Dell", slug: "dell-xps-15-i7-512gb",
    price: 4199, original_price: 5999, currency: "AED", condition: "refurbished", is_active: true, stock_quantity: 3,
    ram: "16GB", storage: "512GB SSD", camera: "720p", battery: "13 hours", display_size: "15.6\"", processor: "Intel Core i7-13700H", os: "Windows 11", color: "Platinum Silver", warranty_months: 12,
    description: "Dell XPS 15 with stunning OLED display. Certified refurbished.", vendor_id: "v3",
    created_at: "2024-11-28T10:00:00Z",
    images: [{ image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop", is_primary: true, display_order: 0 }],
    vendor: vendorMobileHub,
  },
];

export const mockFilterConfig = [
  {
    id: "brand", label: "Brand", filter_type: "checkbox", is_enabled: true, display_order: 1,
    options: ["Apple", "Samsung", "Google", "Sony", "OnePlus", "Dell"], config: {},
  },
  {
    id: "price", label: "Price Range", filter_type: "range", is_enabled: true, display_order: 2,
    options: [], config: { min: 0, max: 10000, step: 100 },
  },
  {
    id: "condition", label: "Condition", filter_type: "badge", is_enabled: true, display_order: 3,
    options: ["new", "used_like_new", "refurbished", "used_good", "used_fair"], config: {},
  },
  {
    id: "storage", label: "Storage", filter_type: "checkbox", is_enabled: true, display_order: 4,
    options: ["64GB", "128GB", "256GB", "512GB", "512GB SSD"], config: {},
  },
  {
    id: "ram", label: "RAM", filter_type: "checkbox", is_enabled: true, display_order: 5,
    options: ["6GB", "8GB", "12GB", "16GB"], config: {},
  },
  {
    id: "color", label: "Color", filter_type: "checkbox", is_enabled: true, display_order: 6,
    options: ["Black", "White", "Blue", "Natural Titanium", "Space Gray", "Titanium Black"], config: {},
  },
  {
    id: "vendor", label: "Seller", filter_type: "checkbox", is_enabled: true, display_order: 7,
    options: ["BitStores", "TechZone UAE", "Mobile Hub"], config: {},
  },
];

export const mockPromoBanners = [
  {
    id: "pb1", title: "iPhone Season Sale", subtitle: "Up to 40% off on all iPhones", image_url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=400&fit=crop",
    link_url: "/search?brand=Apple", bg_color: "hsl(217, 91%, 60%)", text_color: "#ffffff", display_order: 1,
    start_date: "2024-01-01", end_date: "2025-12-31", is_active: true,
  },
  {
    id: "pb2", title: "Samsung Galaxy Deals", subtitle: "Flagship phones at unbeatable prices", image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=400&fit=crop",
    link_url: "/search?brand=Samsung", bg_color: "hsl(260, 60%, 50%)", text_color: "#ffffff", display_order: 2,
    start_date: "2024-01-01", end_date: "2025-12-31", is_active: true,
  },
  {
    id: "pb3", title: "Trade-In & Save", subtitle: "Get up to AED 2000 for your old device", image_url: null,
    link_url: "/trade-in", bg_color: "hsl(160, 60%, 40%)", text_color: "#ffffff", display_order: 3,
    start_date: "2024-01-01", end_date: "2025-12-31", is_active: true,
  },
];

export function getProductBySlug(slug: string): MockProduct | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getRelatedProducts(currentId: string, brand: string): MockProduct[] {
  const sameBrand = mockProducts.filter((p) => p.brand === brand && p.id !== currentId && p.is_active);
  if (sameBrand.length > 0) return sameBrand.slice(0, 4);
  return mockProducts.filter((p) => p.id !== currentId && p.is_active).slice(0, 4);
}

export function getVariants(brand: string, baseModel: string): MockProduct[] {
  const keywords = baseModel.split(" ").filter((w) => w.length > 1).slice(0, 3);
  return mockProducts.filter((p) => {
    if (p.brand !== brand || !p.is_active) return false;
    return keywords.every((kw) => p.name.toLowerCase().includes(kw.toLowerCase()));
  });
}
