export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KasirManagementClient, DeleteCashierButton } from "./KasirManagementClient";
import { Users, Mail, ShieldCheck } from "lucide-react";

export default async function KasirManagementPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "OWNER" || !session.user.umkmId) {
    redirect("/login");
  }

  const cashiers = await prisma.user.findMany({
    where: { 
      umkmId: session.user.umkmId,
      role: "KASIR"
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manajemen Akun Kasir</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola akses untuk karyawan kasir di warung Anda.</p>
        </div>
        <KasirManagementClient />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cashiers.map((cashier) => (
          <Card key={cashier.id} className="glass-card hover:shadow-lg transition-all duration-300 border-white/60">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Users className="w-5 h-5 text-[#1D9E75]" />
                </div>
                <DeleteCashierButton id={cashier.id} name={cashier.name} />
              </div>
              <CardTitle className="text-lg font-bold mt-2 truncate">{cashier.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{cashier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium text-xs">Role: Kasir</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {cashiers.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card rounded-2xl">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada akun kasir. Klik tombol di atas untuk membuat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
