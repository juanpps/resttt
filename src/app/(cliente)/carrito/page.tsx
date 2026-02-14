'use client';

import { useCartStore } from '@/hooks/stores/useCartStore';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
    const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center px-container py-20 text-center bg-[var(--color-bg)]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md"
                >
                    <span className="text-display sm:text-[100px] mb-8 block grayscale opacity-20 select-none">🛒</span>
                    <h1 className="text-display tracking-tighter mb-4">Tu carrito está liviano.</h1>
                    <p className="text-[var(--color-text-muted)] text-lg font-medium mb-12">
                        Parece que aún no has descubierto nuestras delicias de temporada.
                    </p>
                    <Link href="/menu">
                        <Button size="xl" className="px-12">Descubrir Manjares</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    const subtotal = getSubtotal();
    const impuestos = Math.round(subtotal * 0.08);
    const total = subtotal + impuestos;

    return (
        <div className="bg-[var(--color-bg)] min-h-screen px-container py-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-secondary)] text-[var(--color-primary)] flex items-center justify-center font-black text-xl shadow-premium">
                            C
                        </div>
                        <h1 className="text-display tracking-tighter">Bolsa de pedido.</h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Items List */}
                    <div className="lg:col-span-12">
                        <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-2xl border border-[var(--color-secondary)]/5">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.producto.$id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="relative group border-b border-[var(--color-secondary)]/5 py-10 last:border-0"
                                    >
                                        <div className="flex flex-col sm:flex-row items-center gap-10">
                                            {/* Image */}
                                            <div className="relative w-32 h-32 rounded-[24px] overflow-hidden bg-[var(--color-secondary)]/5 shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                                                {item.producto.imagen_url ? (
                                                    <Image
                                                        src={item.producto.imagen_url}
                                                        alt={item.producto.nombre}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-30">🍽️</div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 text-center sm:text-left">
                                                <div className="mb-4">
                                                    <h3 className="text-h3 font-black text-[var(--color-secondary)] tracking-tight mb-1">{item.producto.nombre}</h3>
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">Premium Selection</p>
                                                </div>

                                                <div className="flex items-center justify-center sm:justify-start gap-8">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-4 bg-[var(--color-secondary)]/5 p-2 rounded-2xl border border-[var(--color-secondary)]/5">
                                                        <button
                                                            onClick={() => updateQuantity(item.producto.$id, item.cantidad - 1)}
                                                            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-xl text-[var(--color-secondary)] hover:bg-[var(--color-primary)] transition-all shadow-sm"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="font-black text-lg min-w-[24px] text-center">{item.cantidad}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.producto.$id, item.cantidad + 1)}
                                                            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-xl text-[var(--color-secondary)] hover:bg-[var(--color-primary)] transition-all shadow-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeItem(item.producto.$id)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right shrink-0">
                                                <div className="text-h3 font-black text-[var(--color-secondary)]">
                                                    ${(item.producto.precio * item.cantidad).toLocaleString()}
                                                </div>
                                                <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">
                                                    ${item.producto.precio.toLocaleString()} c/u
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-12">
                                <button
                                    onClick={clearCart}
                                    className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                                >
                                    Limpiar toda la bolsa (RESET)
                                </button>

                                <div className="w-full sm:w-auto space-y-4">
                                    <div className="flex justify-between sm:justify-end sm:gap-12 items-end">
                                        <span className="text-caption font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Total Estimado</span>
                                        <div className="text-display sm:text-[64px] text-[var(--color-secondary)] leading-none italic tracking-tighter">
                                            ${total.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link href="/menu" className="w-full sm:w-auto">
                                            <Button variant="ghost" fullWidth size="xl" className="px-10">Explorar más</Button>
                                        </Link>
                                        <Link href="/checkout" className="w-full sm:w-auto">
                                            <Button variant="secondary" fullWidth size="xl" className="px-16 shadow-premium">Continuar al Pago</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
