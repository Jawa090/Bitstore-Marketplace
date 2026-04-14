import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: { id: string; email: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signOut: async () => {},
  signIn: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  const signOut = async () => setUser(null);
  const signIn = (email: string) => setUser({ id: "demo-user", email });

  return (
    <AuthContext.Provider value={{ user, loading: false, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};
