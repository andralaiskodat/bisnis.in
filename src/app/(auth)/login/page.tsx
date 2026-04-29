"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || "Gagal login: Periksa email dan password Anda.");
      } else {
        toast.success("Berhasil login!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-[#1D9E75] transition-colors font-medium text-sm bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
      </Link>
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-[#1D9E75] rounded-full flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Dibisnis.IN</h1>
        <p className="text-gray-500 mt-2">Platform all-in-one untuk UMKM Kuliner</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl text-center">Login ke Akun Anda</CardTitle>
          <CardDescription className="text-center">
            Masukkan email dan password untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1D9E75] hover:bg-[#157e5d] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-6 border-t pt-6 text-sm text-center text-gray-500">
            <p className="mb-2">Gunakan akun berikut untuk demo:</p>
            <div className="grid grid-cols-2 gap-2 text-left bg-gray-50 p-3 rounded-lg border">
              <div>
                <strong>Owner:</strong><br />
                owner@busari.com<br />
                admin123
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Belum memiliki akun bisnis?{" "}
            <Link href="/register" className="text-[#1D9E75] font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
