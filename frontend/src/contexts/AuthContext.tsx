import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "@/lib/api";

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

interface AuthContextType {
  user: AuthUser | null;
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
}

// ── Context ─────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  signup: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ── Provider ────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch current user from /users/me on app load ─────────────
  const refreshUser = useCallback(async () => {
    let token = localStorage.getItem("accessToken");

    // If accessToken is gone but refreshToken exists, try to silently refresh
    if (!token) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        setUser(null);
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
        setLoading(false);
        return;
      }
    }

    // Now fetch the user profile with a valid token
    try {
      const response = await api.get("/users/me");
      setUser(response.data.data.user);
    } catch {
      // Token invalid even after refresh — clear
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run once on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ── Login ─────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { user: userData, accessToken, refreshToken } = response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(userData);
  };

  // ── Google Login ──────────────────────────────────────────────
  const loginWithGoogle = async (idToken: string) => {
    const response = await api.post("/auth/google", { idToken });
    const { user: userData, accessToken, refreshToken } = response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(userData);
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
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        loginWithGoogle,
        signup,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
