"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Router,
  Package,
  FileBarChart2,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/partners", label: "Partners", icon: Users },
  { href: "/admin/devices", label: "Devices", icon: Router },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart2 },
];

export function AdminSidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground w-64 shrink-0 border-r border-sidebar-border",
        "fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
      aria-label="Sidebar"
    >
      <div className="h-16 flex items-center px-4 text-xl font-semibold border-b border-sidebar-border">
        RPT
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60"
              )}
              onClick={onClose}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
