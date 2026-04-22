"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerBusiness(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const nik = formData.get("nik") as string;
    const umkmName = formData.get("umkmName") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const mapsUrl = formData.get("mapsUrl") as string;

    if (!name || !email || !password || !nik || !umkmName || !city || !address) {
      return { error: "Semua data wajib diisi (kecuali link Google Maps jika tidak ada)" };
    }

    // Periksa apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar. Silakan gunakan email lain." };
    }

    // Buat slug untuk UMKM
    let slug = umkmName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existingUmkm = await prisma.umkm.findUnique({ where: { slug } });
    if (existingUmkm) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Gunakan transaksi untuk memastikan User dan Umkm dibuat bersamaan
    await prisma.$transaction(async (tx) => {
      // 1. Buat UMKM (isActive secara default adalah false, menunggu persetujuan)
      const newUmkm = await tx.umkm.create({
        data: {
          name: umkmName,
          slug: slug,
          city: city,
          address: address,
          mapsUrl: mapsUrl,
          isActive: false, 
        },
      });

      // 2. Buat User (OWNER) dan hubungkan dengan UMKM
      await tx.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
          role: "OWNER",
          nik: nik,
          umkmId: newUmkm.id,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Terjadi kesalahan sistem saat mendaftar" };
  }
}
