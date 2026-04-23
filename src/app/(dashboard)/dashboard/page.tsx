export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";



export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) {
    redirect("/login");
  }

  const umkmId = session.user.umkmId;

  // Get transactions for the last 7 days (start of day)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      umkmId,
      createdAt: { gte: sevenDaysAgo },
    },
    include: {
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTx = transactions.filter(t => new Date(t.createdAt) >= today);
  const pendapatanHariIni = todayTx.reduce((acc, t) => acc + t.totalAmount, 0);
  const pengeluaranHariIni = todayTx.reduce((acc, t) => {
    return acc + t.items.reduce((s, i) => s + i.qty * i.product.costPrice, 0);
  }, 0);

  // Weekly chart data
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const dayTx = transactions.filter(t => {
      const txDate = new Date(t.createdAt);
      return txDate >= date && txDate < nextDate;
    });
    const total = dayTx.reduce((acc, t) => acc + t.totalAmount, 0);
    chartData.push({ name: days[date.getDay()], total });
  }

  // Top products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.product.name, qty: 0, revenue: 0 };
      }
      productSales[item.productId].qty += item.qty;
      productSales[item.productId].revenue += item.qty * item.price;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);
  const maxQty = topProducts[0]?.qty || 1;

  // Recent transactions (last 5)
  const recentTx = transactions.slice(0, 5).map(t => ({
    id: t.id,
    totalAmount: t.totalAmount,
    paymentMethod: t.paymentMethod,
    createdAt: t.createdAt.toISOString(),
    itemCount: t.items.reduce((acc, i) => acc + i.qty, 0),
  }));

  const keuntunganBersih = pendapatanHariIni - pengeluaranHariIni;
  const totalTransaksiHariIni = todayTx.length;

  return (
    <DashboardClient
      pendapatanHariIni={pendapatanHariIni}
      pengeluaranHariIni={pengeluaranHariIni}
      keuntunganBersih={keuntunganBersih}
      totalTransaksiHariIni={totalTransaksiHariIni}
      chartData={chartData}
      topProducts={topProducts}
      maxQty={maxQty}
      recentTx={recentTx}
    />
  );
}

