'use client';

import { EventBanner } from '@/components/layout/EventBanner';
import { BottomNav } from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useCartStore } from '@/hooks/stores/useCartStore';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const itemCount = useCartStore((s) => s.getItemCount());
    const { scrollY } = useScroll();
    const headerShadow = useTransform(scrollY, [0, 50], ["0px 0px 0px rgba(0,0,0,0)", "0px 10px 30px rgba(0,0,0,0.05)"]);
    const headerBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"]);

    return (
        <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-500">
            <EventBanner />

            {/* Premium Sticky Header */}
            <motion.header
                style={{ boxShadow: headerShadow, backdropFilter: headerBlur }}
                className="sticky top-0 z-40 bg-white/70 border-b border-[var(--color-secondary)]/5 px-container h-20 flex items-center"
            >
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 tap-active">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--color-secondary)] flex items-center justify-center text-[var(--color-primary)] font-black text-xl shadow-premium">
                            JM
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-extrabold text-xl tracking-tighter text-[var(--color-secondary)] block leading-none">
                                JM RESTO
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-text-muted)] mt-1 block">
                                Premium Dining
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 bg-[var(--color-secondary)]/5 p-1.5 rounded-2xl border border-[var(--color-secondary)]/5">
                        <Link href="/" className="px-5 py-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] transition-all">Inicio</Link>
                        <Link href="/menu" className="px-5 py-2 text-sm font-bold bg-white text-[var(--color-secondary)] shadow-premium rounded-xl">Menú</Link>
                        <Link href="/favoritos" className="px-5 py-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] transition-all">Favoritos</Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link href="/carrito" className="relative tap-active">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-12 h-12 rounded-2xl bg-[var(--color-secondary)] text-white flex items-center justify-center shadow-premium"
                            >
                                <span className="text-xl">🛒</span>
                                {itemCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[var(--color-primary)] text-[var(--color-secondary)] text-[10px] rounded-full flex items-center justify-center font-black border-2 border-white"
                                    >
                                        {itemCount}
                                    </motion.span>
                                )}
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </motion.header>

            {/* Main Content Area */}
            <main className="pb-32 sm:pb-12">
                {children}
            </main>

            <BottomNav />

            {/* Desktop Footer */}
            <footer className="hidden sm:block bg-[var(--color-secondary)] py-20 px-container">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-white">
                    <div className="col-span-2">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-[var(--color-secondary)] flex items-center justify-center font-black text-2xl mb-6">
                            JM
                        </div>
                        <h3 className="text-h2 font-extrabold mb-4 tracking-tighter">Sabores que trascienden.</h3>
                        <p className="text-[var(--color-text-muted)] max-w-sm">
                            JM Restaurant redefine la experiencia gastronómica digital con estándares de producto 2026.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-[10px] mb-6 opacity-40">Navegación</h4>
                        <ul className="space-y-4 font-semibold">
                            <li><Link href="/menu" className="hover:text-[var(--color-primary)] transition-all">Explorar Menú</Link></li>
                            <li><Link href="/favoritos" className="hover:text-[var(--color-primary)] transition-all">Favoritos</Link></li>
                            <li><Link href="/carrito" className="hover:text-[var(--color-primary)] transition-all">Carrito</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold uppercase tracking-widest text-[10px] mb-6 opacity-40">Contacto</h4>
                        <p className="font-semibold mb-2">hola@jmresto.com</p>
                        <p className="text-[var(--color-text-muted)]">+57 321 000 0000</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
