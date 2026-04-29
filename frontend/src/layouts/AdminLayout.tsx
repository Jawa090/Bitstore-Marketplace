import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = () => {
  const { user, loading } = useAuth();

  console.log('AdminLayout - User:', user);
  console.log('AdminLayout - Loading:', loading);

  // Show loading state
  if (loading) {
    console.log('AdminLayout - Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    console.log('AdminLayout - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  const isAdmin = user?.roles?.some((role) => role.role === "admin");
  
  console.log('AdminLayout - Is Admin:', isAdmin);
  console.log('AdminLayout - User Roles:', user?.roles);

  if (!isAdmin) {
    console.log('AdminLayout - Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('AdminLayout - Rendering admin layout');

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
