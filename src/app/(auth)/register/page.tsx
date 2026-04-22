"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { registerBusiness } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerBusiness(formData);

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      setSuccess(true);
      toast.success("Pendaftaran berhasil diajukan!");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 flex flex-col justify-center items-center p-4">
        <Card className="w-full max-w-md glass-card rounded-3xl border-white/60 p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-[#1D9E75]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Akun bisnis Anda sedang dalam tahap review. Harap menunggu hingga Super Admin menyetujui akun Anda sebelum bisa melakukan Login.
          </p>
          <Link href="/login">
            <Button className="w-full bg-[#1D9E75] hover:bg-[#157e5d] text-white rounded-xl h-12 text-lg">
              Kembali ke Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 flex flex-col justify-center items-center p-4 py-12">
      <div className="mb-6 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-12 h-12 bg-[#1D9E75] rounded-xl flex items-center justify-center shadow-lg shadow-[#1D9E75]/30">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dibisnis.IN</h1>
        </Link>
      </div>

      <Card className="w-full max-w-xl glass-card rounded-3xl border-white/60 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1D9E75] to-[#10b981] p-6 text-white text-center">
          <CardTitle className="text-2xl font-bold">Mulai Bisnis Anda</CardTitle>
          <CardDescription className="text-emerald-50 mt-1">
            Daftarkan UMKM Kuliner Anda secara gratis
          </CardDescription>
        </div>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Informasi Pemilik</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" name="name" required disabled={loading} className="bg-white/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nik">NIK KTP</Label>
                  <Input id="nik" name="nik" required disabled={loading} className="bg-white/50" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Login</Label>
                  <Input id="email" name="email" type="email" required disabled={loading} className="bg-white/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required disabled={loading} className="bg-white/50" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Informasi Bisnis</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="umkmName">Nama Warung / UMKM</Label>
                  <Input id="umkmName" name="umkmName" required disabled={loading} className="bg-white/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Kota / Kabupaten</Label>
                  <Input id="city" name="city" placeholder="Misal: Yogyakarta" required disabled={loading} className="bg-white/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap Warung</Label>
                <Input id="address" name="address" placeholder="Jl. Raya No. 123, Kelurahan, Kecamatan" required disabled={loading} className="bg-white/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mapsUrl">Link Google Maps (Opsional)</Label>
                <Input id="mapsUrl" name="mapsUrl" placeholder="https://maps.app.goo.gl/..." disabled={loading} className="bg-white/50" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1D9E75] hover:bg-[#157e5d] text-white rounded-xl h-12 text-base font-semibold shadow-md shadow-[#1D9E75]/20 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mendaftarkan Bisnis...
                </>
              ) : (
                "Daftar Sekarang"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Sudah mendaftarkan bisnis?{" "}
            <Link href="/login" className="text-[#1D9E75] font-semibold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
