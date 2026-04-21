import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";



export default async function AdminUmkmPage() {
  const umkms = await prisma.umkm.findMany({
    include: {
      users: {
        where: { role: 'OWNER' }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen UMKM</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Semua UMKM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">Nama UMKM</th>
                  <th className="px-6 py-3">Pemilik (Owner)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody>
                {umkms.map((umkm) => (
                  <tr key={umkm.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{umkm.name}</td>
                    <td className="px-6 py-4">
                      {umkm.users.length > 0 ? umkm.users[0].name : <span className="text-gray-400">Tidak ada</span>}
                    </td>
                    <td className="px-6 py-4">
                      {umkm.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>
                      ) : (
                        <Badge variant="destructive">Nonaktif</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(umkm.createdAt), "dd MMM yyyy", { locale: id })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {umkms.length === 0 && (
              <div className="text-center py-8 text-gray-500">Belum ada UMKM terdaftar.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

