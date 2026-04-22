"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { History, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getTodayTransactions, createReport } from "@/app/actions/report";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  totalAmount: number;
  createdAt: Date | string;
  items: Array<{
    qty: number;
    product: {
      name: string;
    };
  }>;
  reports?: Array<{
    status: string;
  }>;
}

export function KasirHistoryClient() {
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTodayTransactions();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTransactions(data as any);
    } catch {
      toast.error("Gagal mengambil riwayat transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = (tx: Transaction) => {
    setSelectedTx(tx);
    setReason("");
    setReportOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!reason.trim() || !selectedTx) return toast.error("Alasan harus diisi");
    setSubmitting(true);
    try {
      await createReport(selectedTx.id, reason);
      toast.success("Laporan berhasil dikirim ke Owner");
      setReportOpen(false);
      fetchTransactions(); // Refresh status
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Gagal mengirim laporan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (val) fetchTransactions();
      }}>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-white/60 backdrop-blur-md border-white/40">
            <History className="w-4 h-4 mr-2" /> Riwayat Hari Ini
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Riwayat Transaksi Hari Ini</DialogTitle>
            <DialogDescription>
              Daftar transaksi yang dilakukan hari ini. Anda dapat melaporkan kesalahan jika ada input yang salah.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-2">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Belum ada transaksi hari ini.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-500">#{tx.id.slice(-8).toUpperCase()}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(tx.createdAt), "HH:mm", { locale: localeId })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Rp {tx.totalAmount.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {tx.items.map((i) => `${i.qty}x ${i.product.name}`).join(", ")}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {tx.reports && tx.reports.length > 0 ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                        {tx.reports[0].status === "PENDING" ? "Menunggu Owner" : "Selesai"}
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => handleOpenReport(tx)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" /> Lapor Salah
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Lapor */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" /> Laporkan Kesalahan
            </DialogTitle>
            <DialogDescription>
              Jelaskan kesalahan input pada transaksi ini. Owner akan meninjau laporan Anda.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            {selectedTx && (
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                <p><strong>ID:</strong> #{selectedTx.id.slice(-8).toUpperCase()}</p>
                <p><strong>Total:</strong> Rp {selectedTx.totalAmount.toLocaleString("id-ID")}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reason">Alasan / Detail Kesalahan</Label>
              <Input 
                id="reason" 
                placeholder="Contoh: Salah jumlah pesanan, harusnya 2 tapi terinput 3" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
              onClick={handleSubmitReport}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Laporan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
