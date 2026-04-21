import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";



export default async function LaporanPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) {
    redirect("/login");
  }

  const transactions = await prisma.transaction.findMany({
    where: { umkmId: session.user.umkmId },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalPendapatan = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  
  // Calculate Pengeluaran (Cost Price)
  let totalPengeluaran = 0;
  transactions.forEach(t => {
    t.items.forEach(item => {
      totalPengeluaran += (item.product.costPrice * item.qty);
    });
  });

  const keuntungan = totalPendapatan - totalPengeluaran;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
        <div className="flex gap-2">
          {/* Simple mock of date range picker */}
          <select className="border rounded-md px-3 py-2 text-sm bg-white">
            <option>Hari Ini</option>
            <option>Minggu Ini</option>
            <option>Bulan Ini</option>
            <option>Semua Waktu</option>
          </select>
          <button className="bg-[#1D9E75] hover:bg-[#157e5d] text-white px-4 py-2 rounded-md text-sm font-medium">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Rp {totalPendapatan.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Pengeluaran (Modal)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rp {totalPengeluaran.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Keuntungan Bersih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Rp {keuntungan.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Jumlah Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">ID Transaksi</th>
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Metode</th>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Total Belanja</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{t.id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      {format(new Date(t.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border">
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {t.items.map(i => `${i.qty}x ${i.product.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#1D9E75]">
                      Rp {t.totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">Belum ada transaksi.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

