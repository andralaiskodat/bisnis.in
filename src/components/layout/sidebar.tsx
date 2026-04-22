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
  { name: "Akun Kasir", href: "/kasir-management", icon: Users },
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

export function Sidebar({
  isOpen = true,
  isMobile = false,
}: {
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
  isMobile?: boolean;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  let routes: typeof ownerRoutes = [];
  if (role === "SUPER_ADMIN") routes = adminRoutes;
  else if (role === "OWNER") routes = ownerRoutes;
  else if (role === "KASIR") routes = kasirRoutes;

  return (
    <aside
      className={cn(
        "bg-white/60 backdrop-blur-2xl border-r border-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] min-h-screen flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out overflow-hidden",
        isMobile
          ? isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
          : isOpen ? "translate-x-0 w-64" : "translate-x-0 w-20"
      )}
    >
      {/* Logo */}
      <div className={cn("p-6 flex items-center", !isOpen && !isMobile ? "justify-center" : "justify-start")}>
        {!isOpen && !isMobile ? (
          <Store className="w-8 h-8 text-[#1D9E75] flex-shrink-0" />
        ) : (
          <h1 className="text-2xl font-bold text-[#1D9E75] flex items-center gap-2 whitespace-nowrap">
            <Store className="w-6 h-6 flex-shrink-0" /> Dibisnis.IN
          </h1>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          const Icon = route.icon;
          return (
            <Link
              key={route.href}
              href={route.href}
              title={!isOpen && !isMobile ? route.name : undefined}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group whitespace-nowrap overflow-hidden",
                !isOpen && !isMobile ? "justify-center gap-0" : "gap-3",
                isActive
                  ? "bg-gradient-to-r from-[#1D9E75] to-[#10b981] text-white shadow-md shadow-[#1D9E75]/20"
                  : "text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm hover:-translate-y-0.5"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-300", !isActive && "group-hover:scale-110")} />
              <span className={cn("transition-all duration-300", !isOpen && !isMobile ? "opacity-0 w-0 hidden" : "opacity-100 block")}>
                {route.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-white/40">
        <div className={cn("mb-3 px-3", !isOpen && !isMobile && "hidden")}>
          <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
        </div>
        <Button
          variant="outline"
          title={!isOpen && !isMobile ? "Logout" : undefined}
          className={cn(
            "flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-all",
            !isOpen && !isMobile ? "w-10 h-10 p-0 mx-auto justify-center" : "w-full justify-start gap-3"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className={cn(!isOpen && !isMobile && "hidden")}>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
