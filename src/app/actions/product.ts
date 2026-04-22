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
  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    imageUrl = `data:${imageFile.type};base64,${base64}`;
  }

  await prisma.product.create({
    data: {
      name,
      category,
      price,
      costPrice,
      stock,
      imageUrl,
      umkmId: session.user.umkmId,
    }
  });

  revalidatePath("/inventori");
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) throw new Error("Unauthorized");

  // Hapus TransactionItems yang mereferensikan produk ini terlebih dahulu
  await prisma.transactionItem.deleteMany({
    where: { productId: id },
  });

  // Baru hapus produknya
  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/inventori");
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const price = parseInt(formData.get("price") as string);
  const costPrice = parseInt(formData.get("costPrice") as string);
  const stock = parseInt(formData.get("stock") as string);
  const imageFile = formData.get("image") as File | null;
  const removeImage = formData.get("removeImage") as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { name, category, price, costPrice, stock };

  if (removeImage === "true") {
    data.imageUrl = null;
  } else if (imageFile && imageFile.size > 0) {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    data.imageUrl = `data:${imageFile.type};base64,${base64}`;
  }

  await prisma.product.update({
    where: { id },
    data,
  });

  revalidatePath("/inventori");
}

