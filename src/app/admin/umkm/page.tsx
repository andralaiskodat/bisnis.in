export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, User, MapPin, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AdminUmkmClient } from "./AdminUmkmClient";

export default async function AdminUmkmPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  // Ambil data UMKM beserta data Owner-nya
  const umkms = await prisma.umkm.findMany({
    include: {
      users: {
        where: { role: "OWNER" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen UMKM</h1>
      </div>

      <Card className="glass-card border-white/60 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1D9E75]/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-2 text-[#1D9E75]">
            <Store className="w-5 h-5" /> Daftar Akun Bisnis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4">Informasi Bisnis</th>
                  <th className="px-6 py-4">Data Pemilik (Owner)</th>
                  <th className="px-6 py-4">Tanggal Daftar</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {umkms.map((umkm) => {
                  const owner = umkm.users[0];
                  return (
                    <tr key={umkm.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-base">{umkm.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {umkm.city || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {owner ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-800 flex items-center gap-1">
                              <User className="w-3 h-3 text-[#1D9E75]" /> {owner.name}
                            </p>
                            <p className="text-xs text-gray-500">{owner.email}</p>
                            <p className="text-xs text-gray-500">NIK: {owner.nik || "-"}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Tidak ada data</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarClock className="w-4 h-4 text-gray-400" />
                          {format(new Date(umkm.createdAt), "dd MMM yyyy", { locale: id })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {umkm.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                            Pending Review
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <AdminUmkmClient id={umkm.id} isActive={umkm.isActive} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {umkms.length === 0 && (
              <div className="text-center py-12">
                <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada UMKM yang mendaftar.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
