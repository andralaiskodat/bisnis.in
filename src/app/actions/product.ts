"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";



export async function addProduct(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const price = parseInt(formData.get("price") as string);
  const costPrice = parseInt(formData.get("costPrice") as string);
  const stock = parseInt(formData.get("stock") as string);

  await prisma.product.create({
    data: {
      name,
      category,
      price,
      costPrice,
      stock,
      umkmId: session.user.umkmId,
    }
  });

  revalidatePath("/inventori");
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) throw new Error("Unauthorized");

  await prisma.product.delete({
    where: { id }
  });

  revalidatePath("/inventori");
}

