import api from './index';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithProducts {
  collection: Omit<Collection, 'is_active'>;
  products: any[]; // Using any for now, can be typed with Product interface
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CollectionsResponse {
  success: boolean;
  data: {
    collections: Collection[];
  };
}

export interface CollectionBySlugResponse {
  success: boolean;
  data: CollectionWithProducts;
}

// ─────────────────────────────────────────────────────────────────────
// GET ALL COLLECTIONS
// ─────────────────────────────────────────────────────────────────────
export const getCollections = async (): Promise<Collection[]> => {
  const response = await api.get<CollectionsResponse>('/v1/collections');
  return response.data.data.collections;
};

// ─────────────────────────────────────────────────────────────────────
// GET COLLECTION BY SLUG WITH PRODUCTS
// ─────────────────────────────────────────────────────────────────────
export const getCollectionBySlug = async (
  slug: string,
  page: number = 1,
  limit: number = 20
): Promise<CollectionWithProducts> => {
  const response = await api.get<CollectionBySlugResponse>(
    `/v1/collections/${slug}`,
    {
      params: { page, limit }
    }
  );
  return response.data.data;
};
