'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productosService } from '@/services/productos.service';
import { categoriasService } from '@/services/categorias.service';
import { ProductForm } from '@/components/admin/ProductForm';
import { PageLoader } from '@/components/ui/Spinner';
import type { Producto, Categoria } from '@/types';
import toast from 'react-hot-toast';

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Producto | null>(null);
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        if (!id) return;

        Promise.all([
            productosService.get(id),
            categoriasService.list()
        ])
            .then(([prod, cats]) => {
                setProduct(prod);
                setCategories(cats);
            })
            .catch((error) => {
                console.error(error);
                toast.error('Error al cargar producto');
                router.push('/admin/productos');
            })
            .finally(() => setLoading(false));
    }, [params.id, router]);

    if (loading) return <PageLoader />;
    if (!product) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-[var(--color-secondary-900)] mb-6">Editar Producto</h1>
            <ProductForm product={product} categories={categories} />
        </div>
    );
}
