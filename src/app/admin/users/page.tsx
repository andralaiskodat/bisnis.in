export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";



export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      umkm: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Users</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Semua Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-[#1D9E75]">Nama UMKM</th>
                  <th className="px-6 py-3">Nama Pengguna</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Asal Kota (UMKM)</th>
                  <th className="px-6 py-3 text-right">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{user.umkm?.name || <span className="text-gray-400">Platform Admin</span>}</p>
                      {user.umkm?.slug && <p className="text-[10px] text-[#1D9E75] font-medium">dibisnis.in/warung/{user.umkm.slug}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-700">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="outline" 
                        className={`uppercase font-bold text-[10px] px-2 py-0.5 rounded-md ${
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                          user.role === 'OWNER' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.umkm?.city || <span className="text-gray-400 italic">Global</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-right">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: id })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">Belum ada pengguna terdaftar.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

