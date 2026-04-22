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
  const city = formData.get("city") as string;
  const address = formData.get("address") as string;
  const mapsUrl = formData.get("mapsUrl") as string;
  const bannerFile = formData.get("banner") as File | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {
    name,
    description,
    phone,
    openHours,
    city,
    address,
    mapsUrl,
  };

  if (bannerFile && bannerFile.size > 0) {
    const buffer = await bannerFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    data.bannerUrl = `data:${bannerFile.type};base64,${base64}`;
  }

  await prisma.umkm.update({
    where: { id: session.user.umkmId },
    data,
  });

  revalidatePath("/storefront/setting");
  revalidatePath("/", "page");
  revalidatePath(`/warung/${session.user.umkmId}`); // Adjusting revalidate if needed
}

