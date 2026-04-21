import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const umkmId = session.user.umkmId;
    if (!umkmId) {
      return NextResponse.json({ error: "No UMKM associated" }, { status: 400 });
    }

    // 1. Ambil data transaksi 7 hari terakhir
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const transactions = await prisma.transaction.findMany({
      where: {
        umkmId,
        createdAt: { gte: sevenDaysAgo },
      },
      include: {
        items: { include: { product: true } }
      }
    });

    // 2. Ambil data produk dan stok
    const products = await prisma.product.findMany({
      where: { umkmId },
      select: { name: true, stock: true, price: true, costPrice: true }
    });

    // 3. Olah data untuk prompt
    let totalRevenue = 0;
    let totalCost = 0;
    const productSales: Record<string, number> = {};
    const dailySales: Record<string, number> = {};

    transactions.forEach(t => {
      const dateKey = t.createdAt.toISOString().split('T')[0];
      if (!dailySales[dateKey]) dailySales[dateKey] = 0;
      dailySales[dateKey] += t.totalAmount;
      
      t.items.forEach(item => {
        totalRevenue += item.qty * item.price;
        totalCost += item.qty * item.product.costPrice;
        if (!productSales[item.product.name]) productSales[item.product.name] = 0;
        productSales[item.product.name] += item.qty;
      });
    });

    const topSelling = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const lowStock = products.filter(p => p.stock < 10).map(p => `${p.name} (Sisa: ${p.stock})`);

    const prompt = `
Anda adalah AI asisten bisnis UMKM Kuliner profesional untuk platform "Dibisnis.IN".
Berikan 3 insight bisnis singkat dan bermanfaat berdasarkan data berikut.

DATA 7 HARI TERAKHIR:
- Total Pendapatan: Rp ${totalRevenue}
- Total Modal: Rp ${totalCost}
- Keuntungan Kotor: Rp ${totalRevenue - totalCost}
- Produk Terlaris: ${topSelling.map(p => `${p[0]} (${p[1]} porsi)`).join(", ")}
- Stok Hampir Habis: ${lowStock.length > 0 ? lowStock.join(", ") : "Aman"}
- Penjualan Harian: ${JSON.stringify(dailySales)}

FORMAT OUTPUT JSON STRICT (Tidak boleh ada markdown block seperti \`\`\`json):
{
  "insights": [
    {
      "type": "stock" atau "peak_hour" atau "prediction" atau "sales" atau "advice",
      "icon": "trending-up" atau "clock" atau "sparkles",
      "text": "Insight maksimal 2 kalimat. Gunakan bahasa Indonesia santai tapi profesional."
    }
  ]
}
`;

    // 4. Panggil Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let insightsData;
    try {
      const responseText = response.text || "{}";
      insightsData = JSON.parse(responseText);
      
      // Validasi struktur jika model halusinasi
      if (!insightsData.insights || !Array.isArray(insightsData.insights)) {
        throw new Error("Invalid response format from Gemini");
      }
    } catch (parseError) {
      console.error("Gagal parse response Gemini:", parseError, response.text);
      // Fallback
      insightsData = {
        insights: [
          {
            type: "sales",
            icon: "sparkles",
            text: `Pendapatan kotor Anda dalam 7 hari terakhir adalah Rp ${totalRevenue.toLocaleString('id-ID')}.`
          }
        ]
      };
    }

    return NextResponse.json(insightsData, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });

  } catch (error) {
    console.error("AI Insight error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
