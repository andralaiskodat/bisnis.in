"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addProduct, deleteProduct, updateProduct } from "@/app/actions/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  imageUrl?: string | null;
};

// ── Tombol Delete ─────────────────────────────────────────────
export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={loading}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={async () => {
        if (!confirm(`Hapus produk "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        setLoading(true);
        try {
          await deleteProduct(id);
          toast.success("Produk berhasil dihapus");
        } catch {
          toast.error("Gagal menghapus produk");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <span className="animate-spin text-xs">⏳</span>
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}

// ── Modal Edit Produk ─────────────────────────────────────────
export function EditProductButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setRemoveImage(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#1D9E75]">Edit Produk</DialogTitle>
        </DialogHeader>

        <form
          action={async (formData) => {
            setLoading(true);
            try {
              if (removeImage) formData.set("removeImage", "true");
              await updateProduct(product.id, formData);
              toast.success("Produk berhasil diperbarui!");
              setOpen(false);
            } catch {
              toast.error("Gagal memperbarui produk");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4 mt-2"
        >
          {/* Foto Produk */}
          <div className="space-y-2">
            <Label>Foto Produk</Label>
            <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center group">
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-xs">Klik untuk upload foto</p>
                </div>
              )}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Produk</Label>
            <Input id="edit-name" name="name" defaultValue={product.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Kategori</Label>
            <Input id="edit-category" name="category" defaultValue={product.category} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-costPrice">Harga Modal (Rp)</Label>
              <Input id="edit-costPrice" name="costPrice" type="number" min="0" defaultValue={product.costPrice} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Harga Jual (Rp)</Label>
              <Input id="edit-price" name="price" type="number" min="0" defaultValue={product.price} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-stock">Stok</Label>
            <Input id="edit-stock" name="stock" type="number" min="0" defaultValue={product.stock} required />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#1D9E75] hover:bg-[#157e5d] text-white h-11 font-semibold"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Tombol Tambah Produk (existing) ──────────────────────────
export function InventoriClient({ isDelete, id, name }: { isDelete?: boolean; id?: string; name?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isDelete) {
    return <DeleteProductButton id={id!} name={name!} />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1D9E75] hover:bg-[#157e5d] shadow-md shadow-[#1D9E75]/20">
          <Plus className="w-4 h-4 mr-2" /> Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#1D9E75]">Tambah Produk Baru</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            setLoading(true);
            try {
              await addProduct(formData);
              toast.success("Produk berhasil ditambahkan");
              setOpen(false);
            } catch {
              toast.error("Gagal menambahkan produk");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4 mt-2"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" name="category" placeholder="Makanan / Minuman / Snack" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          <div className="space-y-2">
            <Label htmlFor="image">Upload Foto (Opsional)</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
          </div>
          <Button type="submit" className="w-full bg-[#1D9E75] hover:bg-[#157e5d] h-11 font-semibold" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
