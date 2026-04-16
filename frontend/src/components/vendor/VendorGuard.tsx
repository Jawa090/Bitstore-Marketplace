import { createContext, useContext, ReactNode } from "react";

const mockVendor = {
  id: "v1", store_name: "BitStores", user_id: "demo-user", status: "approved" as const,
  emirate: "Dubai", commission_rate: 10, is_bitstores: true, logo_url: null,
  contact_email: null, contact_phone: null, address: null, store_description: null,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

const VendorContext = createContext<{ vendor: typeof mockVendor }>({ vendor: mockVendor });
export const useVendor = () => useContext(VendorContext);

const VendorGuard = ({ children }: { children: ReactNode }) => (
  <VendorContext.Provider value={{ vendor: mockVendor }}>{children}</VendorContext.Provider>
);

export default VendorGuard;
