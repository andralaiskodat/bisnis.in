export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
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
      where: { umkmId, createdAt: { gte: sevenDaysAgo } },
      include: { items: { include: { product: true } } },
    });

    // 2. Ambil data produk
    const products = await prisma.product.findMany({
      where: { umkmId },
      select: { name: true, stock: true, price: true, costPrice: true },
    });

    // 3. Olah data
    let totalRevenue = 0;
    let totalCost = 0;
    const productSales: Record<string, number> = {};

    transactions.forEach((t) => {
      t.items.forEach((item) => {
        totalRevenue += item.qty * item.price;
        totalCost += item.qty * item.product.costPrice;
        if (!productSales[item.product.name]) productSales[item.product.name] = 0;
        productSales[item.product.name] += item.qty;
      });
    });

    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;
    const topSelling = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const lowStock = products.filter((p) => p.stock < 10);

    // 4. Coba panggil Gemini API via fetch langsung (lebih stabil)
    const prompt = `Anda adalah AI asisten bisnis UMKM Kuliner untuk platform "Dibisnis.IN".
Berikan TEPAT 3 insight bisnis singkat dalam Bahasa Indonesia berdasarkan data berikut:

DATA 7 HARI TERAKHIR:
- Total Pendapatan: Rp ${totalRevenue.toLocaleString("id-ID")}
- Total Modal: Rp ${totalCost.toLocaleString("id-ID")}
- Keuntungan Bersih: Rp ${profit.toLocaleString("id-ID")}
- Margin Keuntungan: ${profitMargin}%
- Jumlah Transaksi: ${transactions.length}
- Produk Terlaris: ${topSelling.length > 0 ? topSelling.map((p) => `${p[0]} (${p[1]} terjual)`).join(", ") : "Belum ada penjualan"}
- Stok Hampir Habis (<10): ${lowStock.length > 0 ? lowStock.map((p) => `${p.name} (sisa ${p.stock})`).join(", ") : "Semua stok aman"}

Balas HANYA dengan JSON valid tanpa markdown, format persis:
{"insights":[{"icon":"trending-up","text":"..."},{"icon":"sparkles","text":"..."},{"icon":"clock","text":"..."}]}

Gunakan icon dari: "trending-up", "clock", "sparkles". Masing-masing text maksimal 2 kalimat, bahasa Indonesia yang santai dan profesional.`;

    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            },
          }),
          signal: AbortSignal.timeout(20000), // 20 detik timeout
        }
      );

      if (!geminiRes.ok) {
        throw new Error(`Gemini API error: ${geminiRes.status}`);
      }

      const geminiData = await geminiRes.json();
      const rawText: string =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      // Bersihkan dari markdown code block jika ada
      const cleaned = rawText.replace(/```json\n?|```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed?.insights && Array.isArray(parsed.insights) && parsed.insights.length > 0) {
        return NextResponse.json(parsed, {
          headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate" },
        });
      }
      throw new Error("Invalid structure from Gemini");
    } catch (geminiError) {
      console.error("Gemini call failed, using smart fallback:", geminiError);
    }

    // 5. Fallback cerdas berbasis data nyata (tanpa AI)
    const fallbackInsights = [];

    if (transactions.length === 0) {
      fallbackInsights.push({
        icon: "sparkles",
        text: "Belum ada transaksi dalam 7 hari terakhir. Yuk mulai promosikan menu Anda agar lebih banyak pelanggan datang! 🚀",
      });
    } else {
      fallbackInsights.push({
        icon: "trending-up",
        text: `Total pendapatan 7 hari terakhir mencapai Rp ${totalRevenue.toLocaleString("id-ID")} dengan margin keuntungan ${profitMargin}%. ${profit > 0 ? "Bisnis Anda sedang berjalan dengan baik!" : "Coba tinjau kembali harga jual agar lebih menguntungkan."}`,
      });

      if (topSelling.length > 0) {
        fallbackInsights.push({
          icon: "sparkles",
          text: `Menu paling laris minggu ini adalah "${topSelling[0][0]}" dengan ${topSelling[0][1]} porsi terjual. Pastikan stoknya selalu tersedia untuk memaksimalkan penjualan!`,
        });
      } else {
        fallbackInsights.push({
          icon: "sparkles",
          text: "Tambahkan beragam produk ke inventori Anda untuk menarik lebih banyak pelanggan dan meningkatkan nilai transaksi.",
        });
      }
    }

    if (lowStock.length > 0) {
      fallbackInsights.push({
        icon: "clock",
        text: `Perhatian: ${lowStock.length} produk hampir kehabisan stok, termasuk "${lowStock[0].name}" (sisa ${lowStock[0].stock}). Segera lakukan restok agar tidak kehilangan pelanggan!`,
      });
    } else {
      fallbackInsights.push({
        icon: "clock",
        text: "Kondisi stok semua produk Anda saat ini aman. Pertahankan manajemen inventori yang baik ini untuk menjaga kelancaran operasional!",
      });
    }

    // Pastikan selalu 3 insight
    while (fallbackInsights.length < 3) {
      fallbackInsights.push({
        icon: "sparkles",
        text: "Coba perbarui foto dan deskripsi produk Anda agar lebih menarik di halaman menu publik, sehingga pelanggan semakin tertarik untuk memesan!",
      });
    }

    return NextResponse.json(
      { insights: fallbackInsights.slice(0, 3) },
      { headers: { "Cache-Control": "s-maxage=300" } }
    );
  } catch (error) {
    console.error("AI Insight error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
