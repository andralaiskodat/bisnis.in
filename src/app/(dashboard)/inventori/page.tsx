export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoriClient, DeleteProductButton, EditProductButton } from "./InventoriClient";
import { ImageIcon } from "lucide-react";

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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Inventori &amp; Menu</h1>
        <InventoriClient />
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">Belum ada produk di inventori.</div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="glass-card rounded-2xl p-4 border border-white/60 space-y-3">
              {/* Product Image */}
              <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{p.category}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <EditProductButton product={p} />
                  <DeleteProductButton id={p.id} name={p.name} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-50 rounded-lg p-2">
                  <p className="text-gray-500">Harga Jual</p>
                  <p className="font-bold text-[#1D9E75]">Rp {p.price.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500">Harga Modal</p>
                  <p className="font-semibold text-gray-700">Rp {p.costPrice.toLocaleString("id-ID")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">Stok:</p>
                {p.stock < 5 ? (
                  <Badge variant="destructive" className="animate-pulse text-xs">Sisa {p.stock}</Badge>
                ) : (
                  <span className="text-xs font-semibold text-gray-800">{p.stock}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block glass-card border-white/60 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1D9E75]/5 to-transparent border-b">
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4">Foto</th>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga Jual</th>
                  <th className="px-6 py-4">Harga Modal</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{p.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{p.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-[#1D9E75] font-bold">
                      Rp {p.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      Rp {p.costPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      {p.stock < 5 ? (
                        <Badge variant="destructive" className="animate-pulse">Sisa {p.stock}</Badge>
                      ) : (
                        <span className="font-semibold text-gray-800">{p.stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <EditProductButton product={p} />
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada produk di inventori.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
