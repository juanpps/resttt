'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { productosService } from '@/services/productos.service';
import { categoriasService } from '@/services/categorias.service';
import { useCartStore } from '@/hooks/stores/useCartStore';
import type { Producto, Categoria } from '@/types';
import { Input } from '@/components/ui/Input';
import { ProductCard } from '@/components/menu/ProductCard';
import toast from 'react-hot-toast';

function MenuContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<Producto[]>([]);
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setActiveCategory(cat);

        const loadData = async () => {
            try {
                const [p, c] = await Promise.all([
                    productosService.listAvailable(),
                    categoriasService.list()
                ]);
                setProducts(p);
                setCategories(c);
            } catch (error) {
                toast.error('Error al cargar el menú');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [searchParams]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = activeCategory === 'all' || p.categoria_id === activeCategory;
            const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, activeCategory, searchQuery]);

    const addItem = useCartStore((s) => s.addItem);

    const handleAddToCart = (p: Producto) => {
        addItem(p);
        toast.success(`¡${p.nombre} agregado!`);
    };

    const handleCategoryChange = (id: string) => {
        setActiveCategory(id);
        const params = new URLSearchParams(searchParams.toString());
        if (id === 'all') params.delete('category');
        else params.set('category', id);
        router.push(`/menu?${params.toString()}`, { scroll: false });
    };

    if (loading) return <div className="min-h-screen bg-[var(--color-bg)] px-container py-20">Cargando menú...</div>;

    return (
        <div className="bg-[var(--color-bg)] min-h-screen pb-32">
            {/* Hero / Filter Bar Sticky */}
            <div className="sticky top-[64px] z-30 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-secondary)]/5 px-container py-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h1 className="text-display tracking-tighter">Nuestro Menú.</h1>
                        <div className="w-full md:w-96">
                            <Input
                                placeholder="Buscar en la carta..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/50"
                            />
                        </div>
                    </div>

                    {/* Categorías Horizontales */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shrink-0 border-2 ${activeCategory === 'all'
                                ? 'bg-[var(--color-secondary)] text-[var(--color-primary)] border-[var(--color-secondary)] shadow-premium'
                                : 'bg-transparent text-[var(--color-secondary)] border-[var(--color-secondary)]/10 hover:border-[var(--color-secondary)]'
                                }`}
                        >
                            Todo
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.$id}
                                onClick={() => handleCategoryChange(cat.$id)}
                                className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shrink-0 border-2 ${activeCategory === cat.$id
                                    ? 'bg-[var(--color-secondary)] text-[var(--color-primary)] border-[var(--color-secondary)] shadow-premium'
                                    : 'bg-transparent text-[var(--color-secondary)] border-[var(--color-secondary)]/10 hover:border-[var(--color-secondary)]'
                                    }`}
                            >
                                {cat.nombre}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid de Productos */}
            <div className="px-container py-12 max-w-7xl mx-auto">
                <AnimatePresence mode="popLayout">
                    {filteredProducts.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        >
                            {filteredProducts.map((p) => (
                                <ProductCard
                                    key={p.$id}
                                    product={p}
                                    onAdd={() => handleAddToCart(p)}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <p className="text-h3 font-black text-[var(--color-secondary)]/20 italic">No encontramos manjares con ese nombre.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg)] px-container py-20">Preparando la mesa...</div>}>
            <MenuContent />
        </Suspense>
    );
}
