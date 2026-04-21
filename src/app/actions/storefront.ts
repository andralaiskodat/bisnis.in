"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";



export async function updateStorefront(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const phone = formData.get("phone") as string;
  const openHours = formData.get("openHours") as string;

  await prisma.umkm.update({
    where: { id: session.user.umkmId },
    data: {
      name,
      description,
      phone,
      openHours,
    }
  });

  revalidatePath("/storefront/setting");
  revalidatePath(`/warung/[slug]`, 'page');
}

