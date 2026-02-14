import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Producto, CartItem } from '@/types';

interface CartStore {
    items: CartItem[];
    addItem: (producto: Producto) => void;
    removeItem: (productoId: string) => void;
    updateQuantity: (productoId: string, cantidad: number) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (producto: Producto) => {
                set((state) => {
                    const existing = state.items.find(
                        (item) => item.producto.$id === producto.$id
                    );
                    if (existing) {
                        return {
                            items: state.items.map((item) =>
                                item.producto.$id === producto.$id
                                    ? { ...item, cantidad: item.cantidad + 1 }
                                    : item
                            ),
                        };
                    }
                    return { items: [...state.items, { producto, cantidad: 1 }] };
                });
            },

            removeItem: (productoId: string) => {
                set((state) => ({
                    items: state.items.filter((item) => item.producto.$id !== productoId),
                }));
            },

            updateQuantity: (productoId: string, cantidad: number) => {
                if (cantidad <= 0) {
                    get().removeItem(productoId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.producto.$id === productoId ? { ...item, cantidad } : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getSubtotal: () => {
                return get().items.reduce(
                    (acc, item) => acc + item.producto.precio * item.cantidad,
                    0
                );
            },

            getItemCount: () => {
                return get().items.reduce((acc, item) => acc + item.cantidad, 0);
            },
        }),
        { name: 'jm-cart' }
    )
);
