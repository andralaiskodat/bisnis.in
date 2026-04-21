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
                  <th className="px-6 py-3">Nama</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Asal UMKM</th>
                  <th className="px-6 py-3">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="uppercase font-semibold text-[10px]">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.umkm ? user.umkm.name : <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
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

