import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";



export default async function AdminDashboardPage() {
  const [totalUmkm, totalUsers, totalTransactions, latestUmkm] = await Promise.all([
    prisma.umkm.count(),
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.umkm.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true, products: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Super Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total UMKM</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUmkm}</div>
            <p className="text-xs text-muted-foreground">UMKM terdaftar di platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Termasuk owner dan kasir</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi Platform</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Transaksi berhasil tercatat</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Placeholder untuk Grafik jika diperlukan, karena data dummy sedikit kita fokus ke tabel dulu */}
        <Card>
          <CardHeader>
            <CardTitle>UMKM Pendaftar Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Nama UMKM</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Tanggal Daftar</th>
                  </tr>
                </thead>
                <tbody>
                  {latestUmkm.map((umkm) => (
                    <tr key={umkm.id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900">{umkm.name}</td>
                      <td className="px-6 py-4 text-gray-500">{umkm.slug}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${umkm.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {umkm.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {format(new Date(umkm.createdAt), "dd MMM yyyy", { locale: id })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {latestUmkm.length === 0 && (
                <div className="text-center py-4 text-gray-500">Belum ada UMKM terdaftar.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

