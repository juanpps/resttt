'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { Producto } from '@/types';

type ProductCardProps = {
    product: Producto;
    onAdd: (p: Producto) => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
    const hasOptions = product.opciones && product.opciones.length > 2 && product.opciones !== '[]';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="group relative bg-white rounded-[32px] p-2 border-2 border-transparent hover:border-[var(--color-primary)] transition-all duration-500 hover:shadow-premium-hover flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative h-64 w-full rounded-[24px] overflow-hidden bg-[var(--color-secondary)]/5">
                {product.imagen_url ? (
                    <Image
                        src={product.imagen_url}
                        alt={product.nombre}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl grayscale opacity-30">
                        🍽️
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.destacado && (
                        <div className="bg-[var(--color-primary)] text-[var(--color-secondary)] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                            ⭐ Top choice
                        </div>
                    )}
                    {!product.disponible && (
                        <div className="bg-white/90 backdrop-blur-md text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                            Agotado
                        </div>
                    )}
                </div>

                {/* Price Tag Overlay */}
                <div className="absolute bottom-4 right-4 bg-[var(--color-secondary)] text-white px-4 py-2 rounded-2xl font-black text-lg shadow-xl border border-white/10">
                    ${product.precio.toLocaleString()}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-h3 font-black text-[var(--color-secondary)] tracking-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {product.nombre}
                    </h3>
                </div>

                <p className="text-caption text-[var(--color-text-muted)] mt-2 line-clamp-2 leading-relaxed h-[42px]">
                    {product.descripcion || 'Una experiencia gastronómica única preparada con los mejores ingredientes.'}
                </p>

                {/* Tags */}
                {product.etiquetas && (
                    <div className="flex flex-wrap gap-2 mt-6 mb-8">
                        {product.etiquetas.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] uppercase font-black tracking-widest text-[var(--color-secondary)]/40 border border-[var(--color-secondary)]/10 px-2 py-1 rounded-lg">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action */}
                <div className="mt-auto">
                    <Button
                        fullWidth
                        onClick={() => onAdd(product)}
                        disabled={!product.disponible}
                        variant={!product.disponible ? 'ghost' : 'secondary'}
                        className="tap-active"
                    >
                        {hasOptions ? 'Personalizar' : '+ Agregar'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
