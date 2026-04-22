import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Store, Search, ChevronLeft } from "lucide-react";
import Link from "next/link";


interface Props {
  params: { slug: string };
  searchParams: { category?: string };
}

export default async function WarungMenuPage({ params, searchParams }: Props) {
  const umkm = await prisma.umkm.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      products: {
        where: { isVisible: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }]
      }
    }
  });

  if (!umkm) notFound();

  const categories = Array.from(new Set(umkm.products.map(p => p.category)));
  const activeCategory = searchParams.category || 'Semua';

  const filteredProducts = activeCategory === 'Semua'
    ? umkm.products
    : umkm.products.filter(p => p.category === activeCategory);

  // Group by category
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped = filteredProducts.reduce((acc: Record<string, any[]>, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/warung/${params.slug}`} className="flex items-center gap-2 text-gray-700 hover:text-[#1D9E75] font-medium">
            <ChevronLeft className="w-5 h-5" /> {umkm.name}
          </Link>
          <Link href="/" className="font-bold text-[#1D9E75] text-sm flex items-center gap-1">
            <Store className="w-4 h-4" /> Dibisnis.IN
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu {umkm.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{umkm.products.length} item tersedia</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
          {['Semua', ...categories].map((cat) => (
            <Link
              key={cat}
              href={`/warung/${params.slug}/menu${cat !== 'Semua' ? `?category=${encodeURIComponent(cat)}` : ''}`}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-[#1D9E75] text-white shadow-sm'
                  : 'bg-white text-gray-600 border hover:border-[#1D9E75] hover:text-[#1D9E75]'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Menu List Grouped */}
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#1D9E75] rounded-full inline-block"></span>
              {category}
            </h2>
            <div className="space-y-3">
              {items.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {p.imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </>
                    ) : (
                      <span className="text-4xl">🍲</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{p.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                    <p className="text-[#1D9E75] font-bold text-lg mt-2">
                      Rp {p.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Tidak ada menu di kategori ini.</p>
          </div>
        )}
      </div>

      <footer className="text-center py-8 text-sm text-gray-400 border-t mt-8">
        <p>Powered by <span className="text-[#1D9E75] font-bold">Dibisnis.IN</span></p>
      </footer>
    </div>
  );
}
