"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Loader2, Ban, Trash2 } from "lucide-react";
import { approveUmkm, suspendUmkm, deleteUmkm } from "@/app/actions/admin";

export function AdminUmkmClient({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!confirm("Apakah Anda yakin ingin menyetujui akun bisnis ini?")) return;
    setLoading("approve");
    const result = await approveUmkm(id);
    if (result.error) toast.error(result.error);
    else toast.success("UMKM berhasil disetujui!");
    setLoading(null);
  };

  const handleSuspend = async () => {
    if (!confirm("Apakah Anda yakin ingin MENANGGUHKAN (suspend) akun bisnis ini? Pengguna tidak akan bisa login.")) return;
    setLoading("suspend");
    const result = await suspendUmkm(id);
    if (result.error) toast.error(result.error);
    else toast.warning("UMKM berhasil ditangguhkan!");
    setLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm("PERINGATAN: Menghapus UMKM akan menghapus SELURUH data terkait (produk, transaksi, user). Tindakan ini tidak bisa dibatalkan!")) return;
    setLoading("delete");
    const result = await deleteUmkm(id);
    if (result.error) toast.error(result.error);
    else toast.success("UMKM berhasil dihapus permanen!");
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-2">
      {!isActive ? (
        <Button
          onClick={handleApprove}
          disabled={!!loading}
          className="bg-[#1D9E75] hover:bg-[#157e5d] text-white shadow-md shadow-[#1D9E75]/20"
          size="sm"
        >
          {loading === "approve" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Setujui
        </Button>
      ) : (
        <Button
          onClick={handleSuspend}
          disabled={!!loading}
          variant="outline"
          className="text-orange-600 border-orange-200 hover:bg-orange-50"
          size="sm"
        >
          {loading === "suspend" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Ban className="w-4 h-4 mr-2" />
          )}
          Suspend
        </Button>
      )}

      <Button
        onClick={handleDelete}
        disabled={!!loading}
        variant="ghost"
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
        size="sm"
      >
        {loading === "delete" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
