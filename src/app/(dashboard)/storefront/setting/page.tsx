import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StorefrontSettingClient } from "./StorefrontSettingClient";



export default async function StorefrontSettingPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) {
    redirect("/login");
  }

  const umkm = await prisma.umkm.findUnique({
    where: { id: session.user.umkmId }
  });

  if (!umkm) return <div>UMKM tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan Storefront</h1>
      <p className="text-gray-500">Sesuaikan tampilan halaman publik warung Anda.</p>
      
      <StorefrontSettingClient umkm={umkm} />
    </div>
  );
}

