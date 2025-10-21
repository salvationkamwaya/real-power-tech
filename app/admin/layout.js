"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const title = useMemo(() => {
    if (!pathname) return "";
    if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
    if (pathname.startsWith("/admin/partners")) return "Partner Management";
    if (pathname.startsWith("/admin/devices"))
      return "Device & Location Management";
    if (pathname.startsWith("/admin/packages")) return "Service Packages";
    if (pathname.startsWith("/admin/reports")) return "Financial Reports";
    return "";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="flex">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {/* mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="flex-1 md:ml-64">
          <AdminHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-6 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
