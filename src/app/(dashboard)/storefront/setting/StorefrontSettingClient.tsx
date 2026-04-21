"use client";

import { useState } from "react";
import { updateStorefront } from "@/app/actions/storefront";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Store, Clock, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";

export function StorefrontSettingClient({ umkm }: { umkm: any }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(umkm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPreview({ ...preview, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1">
        <CardContent className="p-6">
          <form action={async (formData) => {
            setLoading(true);
            try {
              await updateStorefront(formData);
              toast.success("Pengaturan berhasil disimpan");
            } catch (e) {
              toast.error("Gagal menyimpan pengaturan");
            } finally {
              setLoading(false);
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Warung</Label>
              <Input id="name" name="name" value={preview.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Singkat</Label>
              <textarea 
                id="description" 
                name="description" 
                value={preview.description || ''} 
                onChange={handleChange}
                className="w-full min-h-[100px] border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                placeholder="Ceritakan sedikit tentang warung Anda..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor WhatsApp</Label>
                <Input id="phone" name="phone" value={preview.phone || ''} onChange={handleChange} placeholder="0812..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="openHours">Jam Buka</Label>
                <Input id="openHours" name="openHours" value={preview.openHours || ''} onChange={handleChange} placeholder="08.00 - 22.00" />
              </div>
            </div>
            {/* <div className="space-y-2">
              <Label>Banner URL</Label>
              <Input name="bannerUrl" value={preview.bannerUrl || ''} onChange={handleChange} placeholder="https://..." />
            </div> */}

            <Button type="submit" className="w-full bg-[#1D9E75] hover:bg-[#157e5d]" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
            
            <div className="pt-4 border-t mt-4">
              <Link href={`/warung/${umkm.slug}`} target="_blank">
                <Button type="button" variant="outline" className="w-full flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Buka Halaman Publik
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Live Preview</h3>
        <div className="border rounded-2xl overflow-hidden shadow-lg bg-gray-50 flex flex-col h-[600px]">
          {/* Mock Mobile View */}
          <div className="bg-gray-200 h-40 w-full relative">
            {preview.bannerUrl ? (
               <img src={preview.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full bg-[#1D9E75]/20 flex items-center justify-center">
                 <Store className="w-12 h-12 text-[#1D9E75]/40" />
               </div>
            )}
          </div>
          <div className="px-6 py-6 bg-white -mt-6 rounded-t-2xl relative flex-1">
            <h2 className="text-2xl font-bold">{preview.name || "Nama Warung"}</h2>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Clock className="w-4 h-4"/> {preview.openHours || "Jam Buka"}</span>
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Phone className="w-4 h-4"/> {preview.phone || "No WA"}</span>
            </div>
            <p className="mt-4 text-gray-700 leading-relaxed text-sm">
              {preview.description || "Deskripsi belum diisi."}
            </p>
            
            <div className="mt-8">
              <h3 className="font-bold border-b pb-2 mb-4">Menu Unggulan</h3>
              <div className="space-y-3">
                <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
