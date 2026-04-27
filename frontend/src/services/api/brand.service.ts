import api from '../../lib/api';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Brand API calls
export const brandService = {
  // Get all brands
  getBrands: async (): Promise<Brand[]> => {
    const response = await api.get('/brands');
    return response.data.data.brands || response.data.data; // Handle both formats
  },

  // Get brand by ID
  getBrandById: async (id: string): Promise<Brand> => {
    const response = await api.get(`/brands/${id}`);
    return response.data.data.brand || response.data.data;
  },

  // Get brand by slug
  getBrandBySlug: async (slug: string): Promise<Brand> => {
    const response = await api.get(`/brands/slug/${slug}`);
    return response.data.data.brand || response.data.data;
  }
};