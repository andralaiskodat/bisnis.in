"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resolveReport } from "@/app/actions/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Report {
  id: string;
  reportedBy: string;
  reason: string;
  createdAt: Date | string;
  transactionId: string;
  transaction: {
    id: string;
    totalAmount: number;
  };
}

export function LaporanReportsClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolve = async (reportId: string, transactionId: string, action: "DELETE" | "IGNORE") => {
    if (action === "DELETE" && !confirm("Apakah Anda yakin ingin MENGHAPUS transaksi ini? Data akan hilang selamanya.")) return;
    
    setResolving(reportId);
    try {
      await resolveReport(reportId, transactionId, action);
      toast.success(action === "DELETE" ? "Transaksi berhasil dihapus" : "Laporan ditandai selesai");
      setReports(reports.filter(r => r.id !== reportId));
    } catch {
      toast.error("Gagal memproses laporan");
    } finally {
      setResolving(null);
    }
  };

  if (reports.length === 0) return null;

  return (
    <Card className="glass-card border-amber-200 bg-amber-50/20">
      <CardHeader className="pb-3 border-b border-amber-100">
        <CardTitle className="text-base font-bold text-amber-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> Laporan Kesalahan Kasir
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-amber-700 uppercase bg-amber-50">
              <tr>
                <th className="px-6 py-3">Kasir</th>
                <th className="px-6 py-3">Transaksi</th>
                <th className="px-6 py-3">Alasan</th>
                <th className="px-6 py-3">Waktu</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.reportedBy}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="font-mono text-xs font-bold text-gray-500">#{r.transaction.id.slice(-8).toUpperCase()}</p>
                      <p className="font-bold text-[#1D9E75]">Rp {r.transaction.totalAmount.toLocaleString("id-ID")}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 max-w-xs">{r.reason}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(r.createdAt), "dd MMM, HH:mm", { locale: localeId })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        onClick={() => handleResolve(r.id, r.transactionId, "IGNORE")}
                        disabled={!!resolving}
                      >
                        {resolving === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                        Abaikan
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                        onClick={() => handleResolve(r.id, r.transactionId, "DELETE")}
                        disabled={!!resolving}
                      >
                        {resolving === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                        Hapus Transaksi
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
