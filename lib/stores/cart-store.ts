/**
 * Cart Store
 * Zustand store for managing cart items with localStorage persistence
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItemDTO } from "@/lib/types/menu";

interface CartState {
  items: CartItemDTO[];
}

interface CartActions {
  addItem: (item: CartItemDTO) => void;
  removeItem: (menuItemId: string, modifiersKey?: string) => void;
  updateQuantity: (
    menuItemId: string,
    quantity: number,
    modifiersKey?: string,
  ) => void;
  updateItemNotes: (
    menuItemId: string,
    notes: string,
    modifiersKey?: string,
  ) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

type CartStore = CartState & CartActions;

/**
 * Generate a unique key for cart items based on menuItemId and selected modifiers
 * This allows same item with different modifiers to be separate cart entries
 */
function getItemKey(item: CartItemDTO): string {
  const modifiersKey =
    item.selectedModifiers
      ?.map((m) => m.modifierId)
      .sort()
      .join(",") || "";
  return `${item.menuItemId}:${modifiersKey}`;
}

/**
 * Calculate total price for a cart item based on base price, modifiers, and quantity
 */
function calculateItemTotal(item: CartItemDTO): number {
  const modifiersTotal =
    item.selectedModifiers?.reduce((sum, m) => sum + m.price, 0) || 0;
  return (item.basePrice + modifiersTotal) * item.quantity;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const newItemKey = getItemKey(newItem);
          const existingIndex = state.items.findIndex(
            (item) => getItemKey(item) === newItemKey,
          );

          if (existingIndex >= 0) {
            // Item with same modifiers exists - increase quantity
            const updatedItems = [...state.items];
            const existingItem = updatedItems[existingIndex];
            const newQuantity = existingItem.quantity + newItem.quantity;
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: newQuantity,
              totalPrice: calculateItemTotal({
                ...existingItem,
                quantity: newQuantity,
              }),
            };
            return { items: updatedItems };
          }

          // New item - add to cart
          return {
            items: [
              ...state.items,
              {
                ...newItem,
                totalPrice: calculateItemTotal(newItem),
              },
            ],
          };
        });
      },

      removeItem: (menuItemId, modifiersKey) => {
        set((state) => ({
          items: state.items.filter((item) => {
            if (modifiersKey) {
              return getItemKey(item) !== `${menuItemId}:${modifiersKey}`;
            }
            return item.menuItemId !== menuItemId;
          }),
        }));
      },

      updateQuantity: (menuItemId, quantity, modifiersKey) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return {
              items: state.items.filter((item) => {
                if (modifiersKey) {
                  return getItemKey(item) !== `${menuItemId}:${modifiersKey}`;
                }
                return item.menuItemId !== menuItemId;
              }),
            };
          }

          return {
            items: state.items.map((item) => {
              const itemKey = getItemKey(item);
              const targetKey = modifiersKey
                ? `${menuItemId}:${modifiersKey}`
                : menuItemId;

              if (
                modifiersKey
                  ? itemKey === targetKey
                  : item.menuItemId === menuItemId
              ) {
                return {
                  ...item,
                  quantity,
                  totalPrice: calculateItemTotal({ ...item, quantity }),
                };
              }
              return item;
            }),
          };
        });
      },

      updateItemNotes: (menuItemId, notes, modifiersKey) => {
        set((state) => ({
          items: state.items.map((item) => {
            const itemKey = getItemKey(item);
            const targetKey = modifiersKey
              ? `${menuItemId}:${modifiersKey}`
              : menuItemId;

            if (
              modifiersKey
                ? itemKey === targetKey
                : item.menuItemId === menuItemId
            ) {
              return { ...item, notes };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },
    }),
    {
      name: "qrenso_cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// ============================================
// Selector hooks for optimized re-renders
// ============================================

export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () =>
  useCartStore((state) => state.getItemCount());
export const useCartSubtotal = () =>
  useCartStore((state) => state.getSubtotal());
