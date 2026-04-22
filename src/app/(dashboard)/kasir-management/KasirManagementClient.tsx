"use client";

import { useState } from "react";
import { Trash2, UserPlus, Key, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCashier, deleteCashier } from "@/app/actions/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function KasirManagementClient() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1D9E75] hover:bg-[#157e5d] shadow-md shadow-[#1D9E75]/20">
          <UserPlus className="w-4 h-4 mr-2" /> Tambah Akun Kasir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1D9E75]">Buat Akun Kasir Baru</DialogTitle>
        </DialogHeader>
        <form action={async (formData) => {
          setLoading(true);
          try {
            await createCashier(formData);
            toast.success("Akun kasir berhasil dibuat");
            setOpen(false);
          } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || "Gagal membuat akun kasir");
          } finally {
            setLoading(false);
          }
        }} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap Kasir</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="name" name="name" className="pl-10" placeholder="Contoh: Budi Santoso" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Login</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="email" name="email" type="email" className="pl-10" placeholder="kasir@warung.com" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="password" name="password" type="password" className="pl-10" placeholder="Minimal 6 karakter" required />
            </div>
          </div>
          <Button type="submit" className="w-full bg-[#1D9E75] hover:bg-[#157e5d] h-11 font-semibold" disabled={loading}>
            {loading ? "Memproses..." : "Buat Akun Kasir"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCashierButton({ id, name }: { id: string, name: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      disabled={loading}
      onClick={async () => {
        if (confirm(`Hapus akun kasir "${name}"? Kasir ini tidak akan bisa login lagi.`)) {
          setLoading(true);
          try {
            await deleteCashier(id);
            toast.success("Akun kasir dihapus");
          } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || "Gagal menghapus akun");
          } finally {
            setLoading(false);
          }
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
