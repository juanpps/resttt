'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCartStore } from '@/hooks/stores/useCartStore';

const navItems = [
    { label: 'Menú', href: '/menu', icon: '🍔' },
    { label: 'Favoritos', href: '/favoritos', icon: '❤️' },
    { label: 'Carrito', href: '/carrito', icon: '🛒', isCart: true },
    { label: 'Mi Pedido', href: '/pedido', icon: '📋' },
];

export function BottomNav() {
    const pathname = usePathname();
    const cartCount = useCartStore(s => s.items.length);

    // Hide on admin routes
    if (pathname.startsWith('/admin')) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 sm:hidden">
            <div className="glass rounded-[32px] shadow-2xl flex items-center justify-around h-20 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className="relative flex-1 flex flex-col items-center justify-center gap-1 group">
                            <motion.div
                                animate={isActive ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
                                className={`text-2xl transition-all ${isActive ? 'grayscale-0' : 'grayscale opacity-60'}`}
                            >
                                {item.icon}
                            </motion.div>

                            <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-[var(--color-secondary)]' : 'text-[var(--color-text-muted)]'}`}>
                                {item.label}
                            </span>

                            {item.isCart && cartCount > 0 && (
                                <span className="absolute top-2 right-1/4 bg-[var(--color-primary)] text-[var(--color-secondary)] text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {cartCount}
                                </span>
                            )}

                            {isActive && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute -bottom-1 w-1 h-1 bg-[var(--color-secondary)] rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
