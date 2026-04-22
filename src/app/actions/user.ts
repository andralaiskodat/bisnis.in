"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createCashier(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "OWNER" || !session.user.umkmId) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    throw new Error("Semua field harus diisi");
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email sudah digunakan");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "KASIR",
      umkmId: session.user.umkmId
    }
  });

  revalidatePath("/kasir-management");
}

export async function deleteCashier(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "OWNER") {
    throw new Error("Unauthorized");
  }

  // Ensure owner only deletes their own UMKM's cashier
  const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
  if (!userToDelete || userToDelete.umkmId !== session.user.umkmId) {
    throw new Error("User tidak ditemukan atau tidak memiliki akses");
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/kasir-management");
}
