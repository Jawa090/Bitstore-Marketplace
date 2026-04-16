// Mock version — returns default settings (no Supabase)
export interface StoreSettings {
  store_name: string; tagline: string; description: string; logo_url: string; favicon_url: string;
  primary_email: string; support_email: string; phone: string; whatsapp: string;
  address: string; city: string; country: string; region: string; currency: string;
  social_instagram: string; social_facebook: string; social_twitter: string; social_tiktok: string;
}

const defaults: StoreSettings = {
  store_name: "BitStores", tagline: "UAE's premier AI-powered marketplace for mobile phones & accessories.",
  description: "", logo_url: "", favicon_url: "",
  primary_email: "info@bitstores.com", support_email: "support@bitstores.com",
  phone: "+971-XX-XXX-XXXX", whatsapp: "", address: "",
  city: "Dubai", country: "United Arab Emirates", region: "Dubai", currency: "AED",
  social_instagram: "", social_facebook: "", social_twitter: "", social_tiktok: "",
};

export function useStoreSettings() {
  return { data: defaults, isLoading: false, error: null };
}
