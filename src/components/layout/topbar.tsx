"use client";

import { useSession, signOut } from "next-auth/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";

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
      
      <div className="flex items-center gap-4">
        <div className="hidden lg:block text-sm text-gray-500 font-medium">{today}</div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden hover:bg-white/60 transition-colors">
              <Avatar className="h-10 w-10 border border-white/50 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-[#1D9E75] to-[#10b981] text-white font-bold">
                  {session?.user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1 p-1">
                <p className="text-sm font-semibold leading-none text-gray-900">{session?.user?.name}</p>
                <p className="text-xs leading-none text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer p-2.5 rounded-lg transition-colors"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-medium">Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
