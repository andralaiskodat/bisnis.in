import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: { id: string; name: string; price: number }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    set((state) => {
      const existingItem = state.items.find(item => item.productId === product.id);
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
          )
        };
      }
      return { items: [...state.items, { productId: product.id, name: product.name, price: product.price, qty: 1 }] };
    });
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter(item => item.productId !== productId)
    }));
  },
  updateQty: (productId, qty) => {
    set((state) => ({
      items: state.items.map(item =>
        item.productId === productId ? { ...item, qty: Math.max(1, qty) } : item
      )
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.qty, 0);
  }
}));
