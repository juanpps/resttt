'use client';

import { useEffect, useState } from 'react';
import { categoriasService } from '@/services/categorias.service';
import { ProductForm } from '@/components/admin/ProductForm';
import { PageLoader } from '@/components/ui/Spinner';
import type { Categoria } from '@/types';

export default function NewProductPage() {
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        categoriasService.list()
            .then(setCategories)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <PageLoader />;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-[var(--color-secondary-900)] mb-6">Nuevo Producto</h1>
            <ProductForm categories={categories} />
        </div>
    );
}
