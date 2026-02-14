'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { productosService } from '@/services/productos.service';
import { categoriasService } from '@/services/categorias.service';
import { useCartStore } from '@/hooks/stores/useCartStore';
import type { Producto, Categoria } from '@/types';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/menu/ProductCard';
import toast from 'react-hot-toast';

export default function HomePage() {
    const [featured, setFeatured] = useState<Producto[]>([]);
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const addItem = useCartStore((s) => s.addItem);

    useEffect(() => {
        const load = async () => {
            try {
                const [prods, cats] = await Promise.all([
                    productosService.listFeatured(),
                    categoriasService.listVisible(),
                ]);
                setFeatured(prods);
                setCategories(cats);
            } catch (err) {
                console.error('Error loading home:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAddToCart = (p: Producto) => {
        addItem(p);
        toast.success(`¡${p.nombre} agregado!`);
    };

    return (
        <div className="bg-[var(--color-bg)] transition-all duration-500">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[var(--color-secondary)] px-container py-20">
                {/* Decorative background glass elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[var(--color-primary)] rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-5xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-display sm:text-[80px] text-white leading-[0.9] tracking-tighter mb-8 italic">
                            SABORES <br />
                            <span className="text-[var(--color-primary)]">DEL FUTURO.</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                    >
                        JM Restaurant redefine la gastronomía digital con ingredientes de alta gama y una experiencia móvil diseñada para 2026.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/menu" className="w-full sm:w-auto">
                            <Button size="xl" className="w-full sm:w-auto px-12">
                                Explorar Menú
                            </Button>
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button variant="outline" size="xl" className="w-full sm:w-auto px-12 border-white/20 text-white hover:border-white">
                                Iniciar Sesión
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-sm font-black tracking-widest uppercase flex flex-col items-center gap-2"
                >
                    <span>Scroll</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
                </motion.div>
            </section>

            {/* Quick Categories Bar */}
            <section className="bg-white border-b border-[var(--color-secondary)]/5 py-8 overflow-hidden">
                <div className="px-container max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-secondary)]/30 shrink-0">Tendencias:</span>
                        {categories.map((cat) => (
                            <Link key={cat.$id} href={`/menu?categoria=${cat.$id}`}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="px-6 py-2 rounded-2xl bg-[var(--color-secondary)]/5 text-[var(--color-secondary)] text-sm font-bold whitespace-nowrap hover:bg-[var(--color-primary)] transition-all"
                                >
                                    {cat.nombre}
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Selection */}
            <section className="max-w-7xl mx-auto px-container py-24">
                <div className="flex items-end justify-between mb-16 px-2">
                    <div>
                        <h2 className="text-h2 font-black text-[var(--color-secondary)] tracking-tighter mb-2">SELECCIÓN JM.</h2>
                        <p className="text-[var(--color-text-muted)] font-medium italic">Lo más solicitado de la temporada.</p>
                    </div>
                    <Link href="/menu" className="hidden sm:block text-[var(--color-secondary)] font-black text-sm tracking-widest border-b-2 border-[var(--color-primary)] pb-1 hover:border-[var(--color-secondary)] transition-all">
                        VER TODO →
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-[var(--color-secondary)]/5 h-[480px] rounded-[32px]" />
                        ))
                    ) : (
                        featured.map((product) => (
                            <ProductCard
                                key={product.$id}
                                product={product}
                                onAdd={handleAddToCart}
                            />
                        ))
                    )}
                </div>

                <div className="mt-20 text-center sm:hidden">
                    <Link href="/menu">
                        <Button variant="secondary" fullWidth size="lg">Ver todo el catálogo</Button>
                    </Link>
                </div>
            </section>

            {/* Brand Experience Section */}
            <section className="bg-[var(--color-primary)] py-24 px-container">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-display sm:text-[60px] text-[var(--color-secondary)] leading-none tracking-tighter mb-8 italic">
                            COCINA <br /> SIN BORDES.
                        </h2>
                        <p className="text-[var(--color-secondary)]/70 text-lg font-medium mb-12 max-w-md">
                            No es solo comida, es una infraestructura diseñada para deleitar los sentidos y optimizar tu tiempo.
                        </p>
                        <div className="grid grid-cols-2 gap-8 text-[var(--color-secondary)]">
                            <div>
                                <span className="text-3xl font-black block">15 min</span>
                                <span className="text-xs uppercase tracking-widest font-black opacity-40">Tiempo Promedio</span>
                            </div>
                            <div>
                                <span className="text-3xl font-black block">100%</span>
                                <span className="text-xs uppercase tracking-widest font-black opacity-40">Garantía Chef</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative aspect-square rounded-[40px] overflow-hidden shadow-2xl rotate-3 bg-[var(--color-secondary)]">
                        <div className="absolute inset-0 flex items-center justify-center text-8xl grayscale opacity-20">🥩</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
