import api from '../../lib/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  parent_id?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Category API calls
export const categoryService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.data.categories; // Extract categories from nested structure
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data.category;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data.data.category;
  }
};