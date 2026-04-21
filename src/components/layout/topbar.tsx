"use client";

import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function Topbar() {
  const { data: session } = useSession();
  const today = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id });

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Selamat datang, {session?.user?.name?.split(" ")[0]}! 👋
        </h2>
      </div>
      <div className="text-sm text-gray-500 font-medium">{today}</div>
    </header>
  );
}
