import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Store, Clock, Phone, MessageCircle, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";


interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const umkm = await prisma.umkm.findUnique({ where: { slug: params.slug } });
  if (!umkm) return { title: "Warung tidak ditemukan" };
  return {
    title: `${umkm.name} | Dibisnis.IN`,
    description: umkm.description || `Kunjungi ${umkm.name} di Dibisnis.IN`,
  };
}

export default async function WarungPage({ params }: Props) {
  const umkm = await prisma.umkm.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      products: {
        where: { isVisible: true },
        take: 6,
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!umkm) notFound();

  const waLink = umkm.phone
    ? `https://wa.me/${umkm.phone.replace(/\D/g, "")}?text=Halo%20${encodeURIComponent(umkm.name)}%2C%20saya%20ingin%20mengetahui%20lebih%20lanjut.`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Nav */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-[#1D9E75] text-xl flex items-center gap-2">
            <Store className="w-5 h-5" /> Dibisnis.IN
          </Link>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1da851] text-white text-sm px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Hubungi via WA
            </a>
          )}
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative h-52 md:h-72 bg-gradient-to-br from-[#1D9E75] to-[#0d7055] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white"></div>
        </div>
        <div className="relative max-w-3xl mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white">{umkm.name}</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-white/90">
            {umkm.openHours && (
              <span className="flex items-center gap-1.5 text-sm bg-white/10 backdrop-blur px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" /> {umkm.openHours}
              </span>
            )}
            {umkm.phone && (
              <span className="flex items-center gap-1.5 text-sm bg-white/10 backdrop-blur px-3 py-1 rounded-full">
                <Phone className="w-4 h-4" /> {umkm.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Location Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-[#1D9E75]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Lokasi Warung</h2>
              <p className="text-sm text-gray-400 font-medium mb-2">{umkm.city}</p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {umkm.address || "Alamat lengkap belum ditambahkan."}
              </p>
              
              {umkm.mapsUrl && (
                <a
                  href={umkm.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#1D9E75] text-sm font-bold hover:underline"
                >
                  <ExternalLink className="w-4 h-4" /> Buka di Google Maps
                </a>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        {umkm.description && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Tentang Kami</h2>
            <p className="text-gray-600 leading-relaxed">{umkm.description}</p>
          </section>
        )}

        {/* Menu Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Menu Unggulan</h2>
            <Link
              href={`/warung/${umkm.slug}/menu`}
              className="text-[#1D9E75] hover:text-[#157e5d] font-medium text-sm"
            >
              Lihat Semua Menu →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {umkm.products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🍲</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">{p.category}</p>
                  <p className="text-[#1D9E75] font-bold">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA WhatsApp */}
        {waLink && (
          <section className="bg-gradient-to-r from-[#1D9E75] to-[#25D366] rounded-2xl p-6 text-center text-white shadow-lg">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-90" />
            <h2 className="text-xl font-bold mb-2">Tertarik dengan menu kami?</h2>
            <p className="text-white/80 mb-4 text-sm">Hubungi kami langsung via WhatsApp untuk informasi lebih lanjut.</p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#1D9E75] font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-md"
            >
              <MessageCircle className="w-5 h-5" /> Chat Sekarang
            </a>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t mt-8">
        <p>Powered by <span className="text-[#1D9E75] font-bold">Dibisnis.IN</span> — Platform UMKM Kuliner Indonesia</p>
      </footer>
    </div>
  );
}
