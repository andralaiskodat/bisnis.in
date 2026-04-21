"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, FileText, Package, Settings, Users, Store, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";

const ownerRoutes = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Kasir", href: "/kasir", icon: ShoppingCart },
  { name: "Laporan", href: "/laporan", icon: FileText },
  { name: "Inventori", href: "/inventori", icon: Package },
  { name: "Pengaturan Warung", href: "/storefront/setting", icon: Settings },
];

const kasirRoutes = [
  { name: "Kasir", href: "/kasir", icon: ShoppingCart },
];

const adminRoutes = [
  { name: "Dashboard Admin", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Manajemen UMKM", href: "/admin/umkm", icon: Store },
  { name: "Manajemen Users", href: "/admin/users", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  let routes = [];
  if (role === "SUPER_ADMIN") routes = adminRoutes;
  else if (role === "OWNER") routes = ownerRoutes;
  else if (role === "KASIR") routes = kasirRoutes;

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col fixed inset-y-0 left-0 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#1D9E75] flex items-center gap-2">
          <Store className="w-6 h-6" /> Dibisnis.IN
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          const Icon = route.icon;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#1D9E75]/10 text-[#1D9E75]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              {route.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="mb-4 px-3">
          <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
          <p className="text-xs text-gray-500">{session?.user?.email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full flex items-center justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
