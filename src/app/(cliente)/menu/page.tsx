'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { productosService } from '@/services/productos.service';
import { categoriasService } from '@/services/categorias.service';
import { useCartStore } from '@/hooks/stores/useCartStore';
import type { Producto, Categoria } from '@/types';
import { Input } from '@/components/ui/Input';
import { ProductCard } from '@/components/menu/ProductCard';
import toast from 'react-hot-toast';

export default function MenuPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<Producto[]>([]);
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [activeTag, setActiveTag] = useState<string>('all');
    const [search, setSearch] = useState('');
    const addItem = useCartStore((s) => s.addItem);

    useEffect(() => {
        const catParam = searchParams.get('categoria');
        if (catParam) setActiveCategory(catParam);
    }, [searchParams]);

    useEffect(() => {
        const load = async () => {
            try {
                const [prods, cats] = await Promise.all([
                    productosService.listAvailable(),
                    categoriasService.listVisible(),
                ]);
                setProducts(prods);
                setCategories(cats);
            } catch (err) {
                console.error('Error loading menu:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const tags = useMemo(() => {
        const allTags = products.flatMap(p => p.etiquetas || []);
        return Array.from(new Set(allTags)).sort();
    }, [products]);

    const filtered = useMemo(() => {
        let result = products;
        if (activeCategory !== 'all') {
            result = result.filter((p) => p.categoria_id === activeCategory);
        }
        if (activeTag !== 'all') {
            result = result.filter((p) => p.etiquetas?.includes(activeTag));
        }
        if (search) {
            const term = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.nombre.toLowerCase().includes(term) ||
                    p.descripcion.toLowerCase().includes(term)
            );
        }
        return result;
    }, [products, activeCategory, activeTag, search]);

    const handleAdd = (p: Producto) => {
        addItem(p);
        toast.success(`¡${p.nombre} al carrito!`);
    };

    return (
        <div className="bg-[var(--color-bg)] min-h-screen">
            {/* Header Hero */}
            <section className="bg-[var(--color-secondary)] py-20 px-container text-center overflow-hidden relative">
                <motion.div
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 0.1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-[20vw] font-black pointer-events-none text-white select-none"
                >
                    MENU
                </motion.div>
                <div className="relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-display text-[var(--color-primary)] mb-4 tracking-tighter"
                    >
                        Placeres de 2026.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/60 text-lg max-w-xl mx-auto font-medium"
                    >
                        Una curaduría de sabores auténticos con el toque premium de JM Restaurant.
                    </motion.p>
                </div>
            </section>

            {/* Controls Bar */}
            <div className="sticky top-20 z-30 px-container -mt-8">
                <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[var(--color-secondary)]/5 p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full md:flex-1">
                        <Input
                            placeholder="Buscar especialidad..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<span className="text-xl">🔍</span>}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-hide">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-6 h-12 rounded-2xl text-sm font-black whitespace-nowrap transition-all ${activeCategory === 'all'
                                ? 'bg-[var(--color-primary)] text-[var(--color-secondary)] shadow-premium'
                                : 'bg-[var(--color-secondary)]/5 text-[var(--color-text-muted)] hover:bg-[var(--color-secondary)]/10'
                                }`}
                        >
                            Todo
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.$id}
                                onClick={() => setActiveCategory(cat.$id)}
                                className={`px-6 h-12 rounded-2xl text-sm font-black whitespace-nowrap transition-all ${activeCategory === cat.$id
                                    ? 'bg-[var(--color-primary)] text-[var(--color-secondary)] shadow-premium'
                                    : 'bg-[var(--color-secondary)]/5 text-[var(--color-text-muted)] hover:bg-[var(--color-secondary)]/10'
                                    }`}
                            >
                                {cat.nombre}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-container py-16">

                {/* Tags Quick Filter */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-12 justify-center">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)] mr-2">Filtrar:</span>
                        {tags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(activeTag === tag ? 'all' : tag)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${activeTag === tag
                                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)] text-white'
                                    : 'border-[var(--color-secondary)]/5 bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-secondary)]/20'
                                    }`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse bg-[var(--color-secondary)]/5 h-[450px] rounded-[32px]" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-40"
                        >
                            <span className="text-8xl mb-6 block">🍽️</span>
                            <h3 className="text-h2 font-black text-[var(--color-secondary)] mb-2">No se encontró nada</h3>
                            <p className="text-[var(--color-text-muted)] font-medium">Prueba buscando con otros términos o filtros.</p>
                            <button
                                onClick={() => { setActiveCategory('all'); setActiveTag('all'); setSearch(''); }}
                                className="mt-8 text-[var(--color-secondary)] font-bold underline"
                            >
                                Ver todo el menú
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filtered.map((prod) => (
                                <ProductCard
                                    key={prod.$id}
                                    product={prod}
                                    onAdd={handleAdd}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
