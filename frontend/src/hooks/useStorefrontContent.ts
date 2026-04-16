// Mock version — returns fallback data directly (no Supabase)
export function useStorefrontContent<T = any>(_sectionId: string, fallback: T) {
  return {
    data: { content: fallback, is_active: true },
    isLoading: false,
    error: null,
  };
}

export function useAllStorefrontContent() {
  return { data: [], isLoading: false, error: null };
}
