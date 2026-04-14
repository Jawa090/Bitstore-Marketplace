import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";
import { AdminGlobalSearch } from "@/components/admin/AdminGlobalSearch";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LicenseAlertBanner from "@/components/admin/LicenseAlertBanner";

const AdminLayout = () => (
  <AdminGuard>
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border/50 px-4 gap-3">
            <SidebarTrigger />
            <span className="text-sm font-display font-semibold text-primary">BitStores Admin</span>
            <div className="flex-1 flex justify-center">
              <AdminGlobalSearch />
            </div>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Store
              </Button>
            </Link>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <LicenseAlertBanner />
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  </AdminGuard>
);

export default AdminLayout;
