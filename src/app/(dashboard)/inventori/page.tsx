import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoriClient } from "./InventoriClient";



export default async function InventoriPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    where: { umkmId: session.user.umkmId },
    orderBy: { category: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventori & Menu</h1>
        <InventoriClient />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">Nama Produk</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Harga Jual</th>
                  <th className="px-6 py-3">Harga Modal</th>
                  <th className="px-6 py-3">Stok</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{p.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-[#1D9E75] font-semibold">
                      Rp {p.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      Rp {p.costPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      {p.stock < 5 ? (
                        <Badge variant="destructive" className="animate-pulse">Sisa {p.stock}</Badge>
                      ) : (
                        <span className="text-gray-900">{p.stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {/* Using client component for delete action to be simple */}
                      <InventoriClient isDelete id={p.id} name={p.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-8 text-gray-500">Belum ada produk di inventori.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

