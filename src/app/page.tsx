import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Store, ChevronRight, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  
  const umkms = await prisma.umkm.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#1D9E75] font-bold text-xl">
            <Store className="w-6 h-6" /> Dibisnis.IN
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href={session.user?.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/dashboard"}>
                <Button className="bg-[#1D9E75] hover:bg-[#157e5d] rounded-full px-6">
                  Dashboard Saya
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="bg-[#1D9E75] hover:bg-[#157e5d] rounded-full px-6">
                  Masuk / Daftar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0f7656] via-[#1D9E75] to-[#25c48e] text-white py-20 lg:py-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-white blur-[100px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-yellow-300 blur-[120px]"></div>
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Platform Kasir Digital <br className="hidden md:block"/> untuk UMKM Kuliner
          </h1>
          <p className="text-lg md:text-xl text-[#1D9E75] text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Kelola penjualan, inventori, dan promosikan bisnis kuliner Anda secara online dengan mudah, cepat, dan gratis.
          </p>
          {!session && (
            <Link href="/login">
              <Button size="lg" className="bg-white text-[#1D9E75] hover:bg-gray-100 rounded-full px-8 h-14 text-lg font-bold shadow-xl transition-transform hover:scale-105">
                Mulai Bisnis Anda Sekarang
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* UMKM Showcase Section */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Jelajahi Mitra Kami</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Temukan berbagai hidangan lezat dari UMKM kuliner terbaik yang telah menggunakan platform Dibisnis.IN.
          </p>
        </div>

        {umkms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700">Belum ada UMKM terdaftar</h3>
            <p className="text-gray-500 mt-2">Jadilah yang pertama untuk bergabung bersama kami!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {umkms.map((umkm) => (
              <div key={umkm.id} className="glass-card rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:shadow-[#1D9E75]/20 transition-all duration-500 border border-white/60 group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/60 pointer-events-none z-0"></div>
                <div className="h-48 bg-gray-200 relative overflow-hidden z-10">
                  {umkm.bannerUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={umkm.bannerUrl} alt={umkm.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#1D9E75]/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Store className="w-16 h-16 text-[#1D9E75]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-6 right-6 text-2xl font-bold text-white line-clamp-1">{umkm.name}</h3>
                </div>
                <div className="p-6 relative z-10">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px] font-medium">
                    {umkm.description || "UMKM Kuliner mitra Dibisnis.IN yang menyajikan hidangan spesial untuk Anda."}
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/50 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-[#1D9E75]" />
                      <span className="font-medium">{umkm.openHours || "Jam buka tidak tersedia"}</span>
                    </div>
                    {umkm.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/50 p-2 rounded-lg">
                        <Phone className="w-4 h-4 text-[#1D9E75]" />
                        <span className="font-medium">{umkm.phone}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/warung/${umkm.slug}/menu`} className="block w-full">
                    <Button className="w-full bg-gradient-to-r from-[#1D9E75] to-[#10b981] text-white hover:shadow-lg rounded-xl group-hover:scale-[1.02] transition-all duration-300">
                      Lihat Menu <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <Store className="w-10 h-10 text-white/20 mb-4" />
          <p className="text-sm">© {new Date().getFullYear()} Dibisnis.IN. Hak Cipta Dilindungi.</p>
          <p className="text-xs mt-2 text-gray-500">Dibuat untuk memajukan UMKM Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
