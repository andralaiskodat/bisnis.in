"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createReport(transactionId: string, reason: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) throw new Error("Unauthorized");

  // Check if already reported
  const existing = await prisma.transactionReport.findFirst({
    where: { transactionId }
  });

  if (existing) {
    throw new Error("Transaksi ini sudah dilaporkan sebelumnya.");
  }

  await prisma.transactionReport.create({
    data: {
      transactionId,
      umkmId: session.user.umkmId,
      reportedBy: session.user.name || "Kasir",
      reason,
      status: "PENDING"
    }
  });

  revalidatePath("/kasir");
}

export async function resolveReport(reportId: string, transactionId: string, action: "DELETE" | "IGNORE") {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "OWNER") throw new Error("Unauthorized");

  if (action === "DELETE") {
    // Delete transaction items first
    await prisma.transactionItem.deleteMany({
      where: { transactionId }
    });
    
    // Delete the report(s) associated with this transaction
    await prisma.transactionReport.deleteMany({
      where: { transactionId }
    });

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: transactionId }
    });
  } else {
    // Just mark as resolved
    await prisma.transactionReport.update({
      where: { id: reportId },
      data: { status: "RESOLVED" }
    });
  }

  revalidatePath("/laporan");
}

export async function getTodayTransactions() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) throw new Error("Unauthorized");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return await prisma.transaction.findMany({
    where: {
      umkmId: session.user.umkmId,
      createdAt: { gte: startOfDay }
    },
    include: {
      items: { include: { product: true } },
      reports: true // to check if already reported
    },
    orderBy: { createdAt: "desc" }
  });
}
