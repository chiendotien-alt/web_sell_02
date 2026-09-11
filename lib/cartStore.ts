"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

function itemKey(productId: string, variantId: string | null) {
  return `${productId}::${variantId ?? "base"}`;
}

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => {
          const key = itemKey(item.productId, item.variantId);
          const existing = state.items.find((i) => itemKey(i.productId, i.variantId) === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.productId, i.variantId) === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((i) => itemKey(i.productId, i.variantId) !== itemKey(productId, variantId)),
        })),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              itemKey(i.productId, i.variantId) === itemKey(productId, variantId) ? { ...i, quantity } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    { name: "shop-ai-cart" }
  )
);
