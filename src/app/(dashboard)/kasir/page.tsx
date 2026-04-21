"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, Receipt } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function KasirPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  const cart = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?search=${search}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Gagal mengambil data produk");
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          paymentMethod,
          totalAmount: cart.getTotal(),
        }),
      });

      if (res.ok) {
        const transaction = await res.json();
        setLastTransaction({ ...transaction, items: cart.items });
        toast.success("Transaksi berhasil!");
        cart.clearCart();
        setShowReceipt(true);
      } else {
        toast.error("Transaksi gagal diproses");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Cari menu..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => (
                <Card
                  key={p.id}
                  className={`cursor-pointer transition-all hover:border-[#1D9E75] hover:shadow-md ${p.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => cart.addItem({ id: p.id, name: p.name, price: p.price })}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-4xl">🍲</span>
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1" title={p.name}>{p.name}</h3>
                    <p className="text-[#1D9E75] font-bold mt-1">Rp {p.price.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-gray-500 mt-1">Stok: {p.stock}</p>
                  </CardContent>
                </Card>
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">
                  Produk tidak ditemukan.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-96 bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5" /> Pesanan Saat Ini
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-[#1D9E75] text-xs font-bold">Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border">
                  <button onClick={() => cart.updateQty(item.productId, item.qty - 1)} className="p-1 hover:bg-gray-200 rounded">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                  <button onClick={() => cart.updateQty(item.productId, item.qty + 1)} className="p-1 hover:bg-gray-200 rounded">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button onClick={() => cart.removeItem(item.productId)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg ml-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between mb-4">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-xl font-bold text-[#1D9E75]">Rp {cart.getTotal().toLocaleString('id-ID')}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
              variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
              className={paymentMethod === 'CASH' ? 'bg-[#1D9E75] hover:bg-[#157e5d]' : ''}
              onClick={() => setPaymentMethod('CASH')}
            >
              <Banknote className="w-4 h-4 mr-2" /> Tunai
            </Button>
            <Button
              variant={paymentMethod === 'QRIS' ? 'default' : 'outline'}
              className={paymentMethod === 'QRIS' ? 'bg-[#1D9E75] hover:bg-[#157e5d]' : ''}
              onClick={() => setPaymentMethod('QRIS')}
            >
              <QrCode className="w-4 h-4 mr-2" /> QRIS
            </Button>
            <Button
              variant={paymentMethod === 'TRANSFER' ? 'default' : 'outline'}
              className={paymentMethod === 'TRANSFER' ? 'bg-[#1D9E75] hover:bg-[#157e5d]' : ''}
              onClick={() => setPaymentMethod('TRANSFER')}
            >
              <CreditCard className="w-4 h-4 mr-2" /> TF
            </Button>
          </div>

          <Button
            className="w-full h-12 text-lg bg-[#1D9E75] hover:bg-[#157e5d]"
            disabled={cart.items.length === 0 || checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading ? "Memproses..." : "Bayar Sekarang"}
          </Button>
        </div>
      </div>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-[#1D9E75]">Transaksi Berhasil!</DialogTitle>
            <DialogDescription className="text-center">
              Terima kasih, pembayaran via {paymentMethod} telah diterima.
            </DialogDescription>
          </DialogHeader>
          {lastTransaction && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 text-sm font-mono">
              <div className="text-center mb-4 border-b pb-2">
                <p className="font-bold text-lg">DIBISNIS.IN</p>
                <p>ID: {lastTransaction.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="space-y-2 mb-4 border-b pb-4">
                {lastTransaction.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.qty}x {item.name}</span>
                    <span>Rp {(item.qty * item.price).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL</span>
                <span>Rp {lastTransaction.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowReceipt(false)} className="w-full bg-[#1D9E75] hover:bg-[#157e5d]">
              Selesai & Transaksi Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Minimal dummy ShoppingCart icon component for fallback
function ShoppingCart(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
