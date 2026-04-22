"use client";

import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: session } = useSession();
  const today = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id });

  return (
    <header className="h-16 bg-white/40 backdrop-blur-xl border-b border-white/40 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-gray-600 hover:bg-white/60">
          <Menu className="w-5 h-5" />
        </Button>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 line-clamp-1">
          Selamat datang, {session?.user?.name?.split(" ")[0]}! 👋
        </h2>
      </div>
      <div className="hidden md:block text-sm text-gray-500 font-medium">{today}</div>
    </header>
  );
}
