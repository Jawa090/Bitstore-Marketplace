import api from '../../lib/api';

export interface Product {
  id: string;
  vendor_id: string;
  category_id?: string;
  brand_id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  condition: 'new' | 'used_like_new' | 'used_good' | 'used_fair' | 'refurbished';
  stock_quantity: number;
  is_active: boolean;
  ram?: string;
  storage?: string;
  camera?: string;
  battery?: string;
  display_size?: string;
  processor?: string;
  os?: string;
  color?: string;
  warranty_months?: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  // Relations
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  };
  vendor?: {
    id: string;
    store_name: string;
    store_slug: string;
  };
  images?: {
    id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }[];
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Product API calls
export const productService = {
  // Get all products with filters
  getProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data.data.products || response.data.data; // Handle both formats
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product;
  },

  // Get product by slug
  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data.data.product;
  }
};