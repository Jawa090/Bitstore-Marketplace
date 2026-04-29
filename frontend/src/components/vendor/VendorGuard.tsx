import { createContext, useContext, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// ── Vendor context (provides the vendor object to child pages) ──────
interface VendorContextType {
  vendor: {
    id: string;
    store_name: string;
    status: string;
    is_bitstores: boolean;
    created_at: string;
    [key: string]: any;
  };
}

const VendorContext = createContext<VendorContextType>({} as VendorContextType);
export const useVendor = () => useContext(VendorContext);

// ── Guard ───────────────────────────────────────────────────────────
const VendorGuard = ({ children }: { children: ReactNode }) => {
  const { loading, isAuthenticated, vendor, vendorStatus } = useAuth();

  // Auth / vendor data still loading — show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading vendor dashboard…</p>
        </div>
      </div>
    );
  }

  // Not logged in — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Not an approved vendor — redirect to apply page
  if (vendorStatus !== "approved" || !vendor) {
    return <Navigate to="/vendor/apply" replace />;
  }

  // Approved — render children with vendor context
  return (
    <VendorContext.Provider value={{ vendor }}>
      {children}
    </VendorContext.Provider>
  );
};

export default VendorGuard;
