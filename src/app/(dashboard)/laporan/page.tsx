import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import { LaporanFilter } from "./LaporanFilter";
import { LaporanReportsClient } from "./LaporanReportsClient";
import { Suspense } from "react";

function getDateRange(period: string | undefined): { gte?: Date } {
  const now = new Date();
  if (period === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    return { gte: start };
  }
  if (period === "week") {
    const start = new Date(now);
    const day = start.getDay(); // 0 = Sun
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1)); // Senin
    start.setHours(0, 0, 0, 0);
    return { gte: start };
  }
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    return { gte: start };
  }
  return {}; // Semua waktu
}

const periodLabels: Record<string, string> = {
  today: "Hari Ini",
  week: "Minggu Ini",
  month: "Bulan Ini",
  all: "Semua Waktu",
};

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.umkmId) {
    redirect("/login");
  }

  const period = searchParams?.period ?? "all";
  const dateFilter = getDateRange(period);

  const transactions = await prisma.transaction.findMany({
    where: {
      umkmId: session.user.umkmId,
      createdAt: dateFilter,
    },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPendapatan = transactions.reduce((acc, t) => acc + t.totalAmount, 0);

  let totalPengeluaran = 0;
  transactions.forEach((t) => {
    t.items.forEach((item) => {
      totalPengeluaran += item.product.costPrice * item.qty;
    });
  });

  const keuntungan = totalPendapatan - totalPengeluaran;

  // Fetch pending reports
  const pendingReports = await prisma.transactionReport.findMany({
    where: {
      umkmId: session.user.umkmId,
      status: "PENDING"
    },
    include: {
      transaction: true
    },
    orderBy: { createdAt: "desc" }
  });

  const summaryCards = [
    {
      title: "Total Pendapatan",
      value: `Rp ${totalPendapatan.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-emerald-700",
      bg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
      border: "border-emerald-200",
    },
    {
      title: "Total Pengeluaran",
      value: `Rp ${totalPengeluaran.toLocaleString("id-ID")}`,
      icon: TrendingDown,
      color: "text-rose-700",
      bg: "bg-gradient-to-br from-rose-100 to-rose-50",
      border: "border-rose-200",
    },
    {
      title: "Keuntungan Bersih",
      value: `Rp ${keuntungan.toLocaleString("id-ID")}`,
      icon: TrendingUp,
      color: "text-blue-700",
      bg: "bg-gradient-to-br from-blue-100 to-blue-50",
      border: "border-blue-200",
    },
    {
      title: "Jumlah Transaksi",
      value: `${transactions.length}`,
      icon: FileText,
      color: "text-amber-700",
      bg: "bg-gradient-to-br from-amber-100 to-amber-50",
      border: "border-amber-200",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Periode: <span className="font-semibold text-[#1D9E75]">{periodLabels[period] ?? "Semua Waktu"}</span>
            {" · "}
            <span>{transactions.length} transaksi</span>
          </p>
        </div>
        {/* Dropdown filter — Wrapped in Suspense because it uses useSearchParams */}
        <Suspense fallback={<div className="w-36 h-10 bg-gray-100 rounded-xl animate-pulse" />}>
          <LaporanFilter />
        </Suspense>
      </div>

      {/* Cashier Reports Section */}
      <LaporanReportsClient initialReports={pendingReports} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`glass-card border-t-4 ${card.border} hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-semibold text-gray-600 leading-tight">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${card.bg} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className={`text-lg md:text-2xl font-extrabold tracking-tight ${card.color}`}>
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile Transaction Cards */}
      <div className="space-y-3 md:hidden">
        <h2 className="font-semibold text-gray-800 text-sm">Riwayat Transaksi</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 glass-card rounded-2xl">
            Tidak ada transaksi untuk periode ini.
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="glass-card rounded-2xl p-4 border border-white/60">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-mono text-xs text-gray-500 font-semibold">
                    #{t.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(t.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                  </p>
                </div>
                <span className="bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-bold px-2.5 py-1 rounded-lg">
                  {t.paymentMethod}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {t.items.map((i) => `${i.qty}x ${i.product.name}`).join(", ")}
              </p>
              <p className="font-bold text-base text-[#1D9E75]">
                Rp {t.totalAmount.toLocaleString("id-ID")}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block glass-card border-white/60 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1D9E75]/5 to-transparent border-b">
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4">ID Transaksi</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Total Belanja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 font-semibold">
                      #{t.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {format(new Date(t.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-[220px] truncate">
                      {t.items.map((i) => `${i.qty}x ${i.product.name}`).join(", ")}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#1D9E75]">
                      Rp {t.totalAmount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada transaksi untuk periode ini.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
