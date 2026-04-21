"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addProduct, deleteProduct } from "@/app/actions/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InventoriClient({ isDelete, id, name }: { isDelete?: boolean, id?: string, name?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isDelete) {
    return (
      <Button 
        variant="ghost" 
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={async () => {
          if (confirm(`Hapus produk ${name}?`)) {
            try {
              await deleteProduct(id!);
              toast.success("Produk dihapus");
            } catch (e) {
              toast.error("Gagal menghapus produk");
            }
          }
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1D9E75] hover:bg-[#157e5d]">
          <Plus className="w-4 h-4 mr-2" /> Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
        </DialogHeader>
        <form action={async (formData) => {
          setLoading(true);
          try {
            await addProduct(formData);
            toast.success("Produk berhasil ditambahkan");
            setOpen(false);
          } catch (error) {
            toast.error("Gagal menambahkan produk");
          } finally {
            setLoading(false);
          }
        }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" name="category" placeholder="Makanan / Minuman / Snack" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Harga Modal (Rp)</Label>
              <Input id="costPrice" name="costPrice" type="number" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga Jual (Rp)</Label>
              <Input id="price" name="price" type="number" min="0" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stok Awal</Label>
            <Input id="stock" name="stock" type="number" min="0" required />
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="image">Upload Foto (Opsional)</Label>
            <Input id="image" type="file" accept="image/*" />
          </div> */}
          <Button type="submit" className="w-full bg-[#1D9E75] hover:bg-[#157e5d]" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
