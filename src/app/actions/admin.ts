"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveUmkm(umkmId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  try {
    await prisma.umkm.update({
      where: { id: umkmId },
      data: { isActive: true },
    });

    revalidatePath("/admin/umkm");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve UMKM:", error);
    return { error: "Gagal menyetujui UMKM" };
  }
}

export async function suspendUmkm(umkmId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  try {
    await prisma.umkm.update({
      where: { id: umkmId },
      data: { isActive: false },
    });

    revalidatePath("/admin/umkm");
    return { success: true };
  } catch (error) {
    console.error("Failed to suspend UMKM:", error);
    return { error: "Gagal menangguhkan UMKM" };
  }
}

export async function deleteUmkm(umkmId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  try {
    // Manual cascade delete because schema doesn't have it
    await prisma.$transaction(async (tx) => {
      // 1. Delete TransactionItems (need to join through Transaction)
      await tx.transactionItem.deleteMany({
        where: { transaction: { umkmId } }
      });

      // 2. Delete TransactionReports
      await tx.transactionReport.deleteMany({
        where: { umkmId }
      });

      // 3. Delete Transactions
      await tx.transaction.deleteMany({
        where: { umkmId }
      });

      // 4. Delete Products
      await tx.product.deleteMany({
        where: { umkmId }
      });

      // 5. Delete Users
      await tx.user.deleteMany({
        where: { umkmId }
      });

      // 6. Delete UMKM
      await tx.umkm.delete({
        where: { id: umkmId }
      });
    });

    revalidatePath("/admin/umkm");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete UMKM:", error);
    return { error: "Gagal menghapus UMKM" };
  }
}
