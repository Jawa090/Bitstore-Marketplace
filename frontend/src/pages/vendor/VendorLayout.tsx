import VendorGuard from "@/components/vendor/VendorGuard";
import VendorAppSidebar from "@/components/vendor/VendorAppSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const VendorLayout = () => {
  return (
    <VendorGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <VendorAppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <VendorHeader />
            <main className="flex-1 p-4 lg:p-8 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </VendorGuard>
  );
};

export default VendorLayout;
