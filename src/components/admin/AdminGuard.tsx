// AdminGuard — mock version (no Supabase, always allows access for demo)
import { ReactNode } from "react";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default AdminGuard;
