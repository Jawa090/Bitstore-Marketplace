import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api, { checkVendorStatus } from "@/lib/api";
import { syncCartApi } from "@/lib/api";
import { getGuestCartForSync, clearGuestCart } from "@/contexts/CartContext";

// ── Types ───────────────────────────────────────────────────────────
interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  emirate: string | null;
  avatar_url: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

interface VendorProfile {
  id: string;
  store_name: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  is_bitstores: boolean;
  created_at: string;
}

type VendorStatus = "approved" | "pending" | "rejected" | "suspended" | "none";

interface AuthContextType {
  user: AuthUser | null;
  vendor: VendorProfile | null;
  vendorStatus: VendorStatus;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  signup: (data: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
    phone?: string;
    emirate?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshVendorStatus: () => Promise<void>;
}

// ── Context ─────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  user: null,
  vendor: null,
  vendorStatus: "none",
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  signup: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
  refreshVendorStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ── Provider ────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [vendorStatus, setVendorStatus] = useState<VendorStatus>("none");
  const [loading, setLoading] = useState(true);

  // ── Fetch vendor status from /vendor/check ──────────────────────
  const refreshVendorStatus = useCallback(async () => {
    try {
      const response = await checkVendorStatus();
      const vendorData = response.data?.data?.vendor ?? null;
      console.log("Vendor Status Fetched:", vendorData);

      if (vendorData) {
        setVendor(vendorData);
        setVendorStatus(vendorData.status);
      } else {
        setVendor(null);
        setVendorStatus("none");
      }
    } catch {
      // Not a vendor or endpoint error — treat as non-vendor
      setVendor(null);
      setVendorStatus("none");
    }
  }, []);

  // ── Fetch current user from /users/me on app load ─────────────
  const refreshUser = useCallback(async () => {
    let token = localStorage.getItem("accessToken");

    // If accessToken is gone but refreshToken exists, try to silently refresh
    if (!token) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        setUser(null);
        setVendor(null);
        setVendorStatus("none");
        setLoading(false);
        return;
      }

      // Attempt silent refresh
      try {
        const refreshResponse = await api.post("/auth/refresh", { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = refreshResponse.data.data;
        localStorage.setItem("accessToken", newAccess);
        localStorage.setItem("refreshToken", newRefresh);
        token = newAccess;
      } catch {
        // Refresh token is also expired — clear everything
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setVendor(null);
        setVendorStatus("none");
        setLoading(false);
        return;
      }
    }

    // Now fetch the user profile with a valid token
    try {
      const response = await api.get("/users/me");
      setUser(response.data.data.user);

      // Fetch vendor status after confirming auth
      await refreshVendorStatus();
    } catch {
      // Token invalid even after refresh — clear
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setVendor(null);
      setVendorStatus("none");
    } finally {
      setLoading(false);
    }
  }, [refreshVendorStatus]);

  // Run once on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ── Sync guest cart to backend after auth ──────────────────────
  const syncGuestCartToBackend = async () => {
    const guestItems = getGuestCartForSync();
    if (guestItems.length > 0) {
      try {
        await syncCartApi(guestItems);
        clearGuestCart();
      } catch {
        // Silently fail — cart items stay in localStorage
      }
    }
  };

  // ── Login ─────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { user: userData, accessToken, refreshToken } = response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(userData);

    // Fetch vendor status immediately after login
    await refreshVendorStatus();

    // Sync guest cart silently
    await syncGuestCartToBackend();
  };

  // ── Google Login ──────────────────────────────────────────────
  const loginWithGoogle = async (idToken: string) => {
    const response = await api.post("/auth/google", { idToken });
    const { user: userData, accessToken, refreshToken } = response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(userData);

    // Fetch vendor status immediately after login
    await refreshVendorStatus();

    // Sync guest cart silently
    await syncGuestCartToBackend();
  };

  // ── Signup ────────────────────────────────────────────────────
  const signup = async (data: {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
    phone?: string;
    emirate?: string;
  }) => {
    // We don't auto-login after signup — user is redirected to /login
    await api.post("/auth/register", data);
  };

  // ── Logout ────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the API call fails, we still clear locally
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setVendor(null);
    setVendorStatus("none");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        vendorStatus,
        loading,
        isAuthenticated,
        login,
        loginWithGoogle,
        signup,
        signOut,
        refreshUser,
        refreshVendorStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
