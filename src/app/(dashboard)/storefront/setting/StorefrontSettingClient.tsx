"use client";

import { useState } from "react";
import { updateStorefront } from "@/app/actions/storefront";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Store, Clock, Phone, ExternalLink, ImageIcon, Upload } from "lucide-react";
import Link from "next/link";

export function StorefrontSettingClient({ umkm }: { umkm: { slug: string; name?: string | null; description?: string | null; phone?: string | null; openHours?: string | null; bannerUrl?: string | null; city?: string | null; address?: string | null; mapsUrl?: string | null } }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(umkm);
  const [bannerPreview, setBannerPreview] = useState(umkm.bannerUrl);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPreview({ ...preview, [e.target.name]: e.target.value });
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1 border-white/60 glass-card">
        <CardContent className="p-6">
          <form action={async (formData) => {
            setLoading(true);
            try {
              await updateStorefront(formData);
              toast.success("Pengaturan berhasil disimpan");
            } catch {
              toast.error("Gagal menyimpan pengaturan");
            } finally {
              setLoading(false);
            }
          }} className="space-y-4">
            
            {/* Upload Banner */}
            <div className="space-y-2">
              <Label>Banner / Foto Warung</Label>
              <div className="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#1D9E75]/50 transition-colors bg-gray-50 h-40 flex flex-col items-center justify-center gap-2">
                {bannerPreview ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={bannerPreview} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                   <div className="text-center text-gray-400">
                     <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                     <p className="text-xs">Klik untuk upload banner warung</p>
                   </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                    <Upload className="w-6 h-6" />
                  </div>
                </div>
                <input 
                  type="file" 
                  name="banner" 
                  accept="image/*" 
                  onChange={handleBannerChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
              <p className="text-[10px] text-gray-400">Rekomendasi: Landscape (16:9) dengan resolusi tinggi.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Warung</Label>
                <Input id="name" name="name" value={preview.name || ''} onChange={handleChange} required className="rounded-xl border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Kota / Kabupaten</Label>
                <Input id="city" name="city" value={preview.city || ''} onChange={handleChange} required className="rounded-xl border-gray-200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Input id="address" name="address" value={preview.address || ''} onChange={handleChange} required className="rounded-xl border-gray-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapsUrl">Link Google Maps</Label>
              <Input id="mapsUrl" name="mapsUrl" value={preview.mapsUrl || ''} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="rounded-xl border-gray-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Singkat</Label>
              <textarea 
                id="description" 
                name="description" 
                value={preview.description || ''} 
                onChange={handleChange}
                className="w-full min-h-[100px] border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 transition-all"
                placeholder="Ceritakan sedikit tentang warung Anda..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor WhatsApp</Label>
                <Input id="phone" name="phone" value={preview.phone || ''} onChange={handleChange} placeholder="0812..." className="rounded-xl border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="openHours">Jam Buka</Label>
                <Input id="openHours" name="openHours" value={preview.openHours || ''} onChange={handleChange} placeholder="08.00 - 22.00" className="rounded-xl border-gray-200" />
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#1D9E75] hover:bg-[#157e5d] h-12 rounded-xl font-bold text-white shadow-lg shadow-[#1D9E75]/20" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
            
            <div className="pt-4 border-t mt-4">
              <Link href={`/warung/${umkm.slug}/menu`} target="_blank">
                <Button type="button" variant="outline" className="w-full h-11 rounded-xl flex items-center gap-2 border-gray-200 hover:bg-gray-50">
                  <ExternalLink className="w-4 h-4" /> Buka Halaman Publik
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Live Preview Halaman Warung</h3>
        <div className="border border-white/60 rounded-[2rem] overflow-hidden shadow-2xl bg-gray-50 flex flex-col h-[600px] relative ring-8 ring-gray-100/50">
          {/* Mock Mobile View */}
          <div className="bg-gray-200 h-48 w-full relative overflow-hidden">
            {bannerPreview ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-[#1D9E75]/20 to-[#1D9E75]/5 flex items-center justify-center">
                 <Store className="w-16 h-16 text-[#1D9E75]/20" />
               </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
          <div className="px-6 py-6 bg-white -mt-8 rounded-t-[2rem] relative flex-1 shadow-inner">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900">{preview.name || "Nama Warung"}</h2>
            <div className="flex flex-wrap gap-3 mt-4 text-[12px] font-medium">
              <span className="flex items-center gap-1.5 bg-emerald-50 text-[#1D9E75] px-3 py-1.5 rounded-full shadow-sm"><Clock className="w-3.5 h-3.5"/> {preview.openHours || "Jam Buka"}</span>
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full shadow-sm"><Phone className="w-3.5 h-3.5"/> {preview.phone || "No WA"}</span>
            </div>
            <p className="mt-6 text-gray-600 leading-relaxed text-sm">
              {preview.description || "Deskripsi belum diisi. Ceritakan tentang keunikan warung Anda di sini."}
            </p>
            
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Menu Unggulan</h3>
                <span className="text-xs text-[#1D9E75] font-bold">Lihat Semua</span>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center px-4 gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-2 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                    </div>
                    <div className="w-12 h-6 bg-emerald-100 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
