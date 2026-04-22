"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Clock, DollarSign, Activity, Package, FileText, ShoppingBag } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Props {
  pendapatanHariIni: number;
  pengeluaranHariIni: number;
  keuntunganBersih: number;
  totalTransaksiHariIni: number;
  chartData: { name: string; total: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  maxQty: number;
  recentTx: { id: string; totalAmount: number; paymentMethod: string; createdAt: string; itemCount: number }[];
}

export function DashboardClient({
  pendapatanHariIni,
  pengeluaranHariIni,
  keuntunganBersih,
  totalTransaksiHariIni,
  chartData,
  topProducts,
  maxQty,
  recentTx,
}: Props) {
  const [insights, setInsights] = useState<{ icon: string; text: string }[]>([]);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch("/api/ai/insight");
        const data = await res.json();
        if (data.insights) setInsights(data.insights);
      } catch {
        console.error("Failed to fetch AI insights");
      } finally {
        setInsightLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const metricCards = [
    {
      title: "Pendapatan Hari Ini",
      value: formatRupiah(pendapatanHariIni),
      icon: DollarSign,
      color: "text-emerald-700",
      bg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
      border: "border-emerald-200",
      sub: "Total pemasukan hari ini",
    },
    {
      title: "Keuntungan Bersih",
      value: formatRupiah(keuntunganBersih),
      icon: Activity,
      color: "text-blue-700",
      bg: "bg-gradient-to-br from-blue-100 to-blue-50",
      border: "border-blue-200",
      sub: "Pendapatan dikurangi modal",
    },
    {
      title: "Total Transaksi",
      value: totalTransaksiHariIni.toString(),
      icon: FileText,
      color: "text-amber-700",
      bg: "bg-gradient-to-br from-amber-100 to-amber-50",
      border: "border-amber-200",
      sub: "Jumlah transaksi hari ini",
    },
    {
      title: "Pengeluaran (Modal)",
      value: formatRupiah(pengeluaranHariIni),
      icon: Package,
      color: "text-rose-700",
      bg: "bg-gradient-to-br from-rose-100 to-rose-50",
      border: "border-rose-200",
      sub: "Total harga modal terjual",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Bisnis</h1>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-t-4 ${card.border} glass-card`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">{card.title}</CardTitle>
                <div className={`p-2.5 rounded-xl shadow-sm ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-extrabold tracking-tight ${card.color} drop-shadow-sm`}>{card.value}</div>
                <p className="text-xs text-gray-500 font-medium mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Pendapatan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: unknown) => [formatRupiah(Number(v)), "Pendapatan"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
                <Bar dataKey="total" fill="#1D9E75" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insight */}
        <Card className="bg-gradient-to-br from-[#1D9E75] to-[#0f7656] text-white border-0 shadow-lg shadow-[#1D9E75]/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg font-bold drop-shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse text-yellow-300" /> AI Insight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insightLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#1D9E75]/20 rounded-xl"></div>)}
              </div>
            ) : insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className="flex gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-sm hover:bg-white/20 transition-colors">
                  <div className="mt-0.5 flex-shrink-0">
                    {insight.icon === "trending-up" && <TrendingUp className="w-5 h-5 text-blue-200" />}
                    {insight.icon === "clock" && <Clock className="w-5 h-5 text-amber-200" />}
                    {insight.icon === "sparkles" && <Sparkles className="w-5 h-5 text-yellow-200" />}
                  </div>
                  <p className="text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm">{insight.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/70 text-center py-4 font-medium">Tidak ada insight saat ini.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ShoppingBag className="w-4 h-4 text-[#1D9E75]" /> Menu Terlaris (7 Hari)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada data penjualan.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#{idx + 1}</span> {p.name}
                    </span>
                    <span className="text-[#1D9E75] font-semibold">{p.qty} porsi</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#1D9E75] to-[#25c48e] transition-all duration-500"
                      style={{ width: `${(p.qty / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTx.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada transaksi.</p>
            ) : (
              <div className="space-y-3">
                {recentTx.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        #{tx.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(tx.createdAt), "dd MMM, HH:mm", { locale: id })} · {tx.itemCount} item · {tx.paymentMethod}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#1D9E75]">{formatRupiah(tx.totalAmount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
