'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { productosService } from '@/services/productos.service';
import { type Producto, type Categoria } from '@/types';
import toast from 'react-hot-toast';
import { productoSchema } from '@/lib/validations';
import Image from 'next/image';

// Extend schema for form handling (image file)
const formSchema = productoSchema.extend({
    imageFile: z.any().optional(), // File list
});

type ProductFormProps = {
    product?: Producto;
    categories: Categoria[];
};

export function ProductForm({ product, categories }: ProductFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>(product?.imagen_url || '');

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: product?.nombre || '',
            descripcion: product?.descripcion || '',
            precio: product?.precio || 0,
            categoria_id: product?.categoria_id || categories[0]?.$id || '',
            disponible: product?.disponible ?? true,
            destacado: product?.destacado ?? false,
            stock: product?.stock || 0,
            imagen_url: product?.imagen_url || '',
            ingredientes: product?.ingredientes || [],
            opciones: product?.opciones || '[]', // JSON string
            etiquetas: product?.etiquetas || [],
        },
    });

    // Handle Ingredients (Simple Array)
    const [ingredientInput, setIngredientInput] = useState('');
    const ingredients = watch('ingredientes');

    const addIngredient = () => {
        if (ingredientInput.trim()) {
            setValue('ingredientes', [...(ingredients || []), ingredientInput.trim()]);
            setIngredientInput('');
        }
    };

    const removeIngredient = (index: number) => {
        setValue('ingredientes', ingredients?.filter((_, i) => i !== index));
    };

    // Handle Image Upload Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue('imageFile', e.target.files);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: any) => {
        setSaving(true);
        try {
            let imageUrl = data.imagen_url;

            // Upload new image if selected
            if (data.imageFile && data.imageFile.length > 0) {
                toast.loading('Subiendo imagen...', { id: 'upload' });
                imageUrl = await productosService.uploadImage(data.imageFile[0]);
                toast.success('Imagen subida', { id: 'upload' });
            }

            const payload = {
                ...data,
                imagen_url: imageUrl,
                precio: Number(data.precio),
                stock: Number(data.stock),
            };
            delete payload.imageFile; // Cleanup

            if (product) {
                await productosService.update(product.$id, payload);
                toast.success('Producto actualizado');
            } else {
                await productosService.create(payload);
                toast.success('Producto creado');
            }

            router.push('/admin/productos');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar producto');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h2 className="text-lg font-bold mb-4">Información Básica</h2>
                        <div className="space-y-4">
                            <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message as string} />
                            <Textarea label="Descripción" {...register('descripcion')} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Precio" type="number" {...register('precio', { valueAsNumber: true })} error={errors.precio?.message as string} />
                                <Input label="Stock" type="number" {...register('stock', { valueAsNumber: true })} error={errors.stock?.message as string} />
                            </div>
                            <Select
                                label="Categoría"
                                {...register('categoria_id')}
                                options={categories.map(c => ({ value: c.$id, label: c.nombre }))}
                                error={errors.categoria_id?.message as string}
                            />
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-lg font-bold mb-4">Ingredientes</h2>
                        <div className="flex gap-2 mb-3">
                            <Input
                                placeholder="Agregar ingrediente..."
                                value={ingredientInput}
                                onChange={(e) => setIngredientInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                            />
                            <Button type="button" onClick={addIngredient} variant="secondary">Agregar</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {ingredients?.map((ing: string, i: number) => (
                                <span key={i} className="bg-[var(--color-secondary-100)] px-2 py-1 rounded text-sm flex items-center gap-2">
                                    {ing}
                                    <button type="button" onClick={() => removeIngredient(i)} className="text-red-500 font-bold">×</button>
                                </span>
                            ))}
                        </div>
                    </Card>

                    {/* Simplified JSON Editor for Options for now */}
                    <Card>
                        <h2 className="text-lg font-bold mb-4">Opciones Avanzadas (JSON)</h2>
                        <p className="text-xs text-[var(--color-secondary-500)] mb-2">
                            Formato: {`[ { "nombre": "Salsa", "valores": [ { "nombre": "Ajo", "precio": 0 } ] } ]`}
                        </p>
                        <Textarea {...register('opciones')} rows={5} className="font-mono text-xs" />
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-lg font-bold mb-4">Imagen</h2>
                        <div className="border-2 border-dashed border-[var(--color-secondary-200)] rounded-lg p-4 text-center hover:bg-[var(--color-secondary-50)] transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                            />
                            {previewUrl ? (
                                <div className="relative aspect-video w-full rounded overflow-hidden">
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="py-8 text-[var(--color-secondary-400)]">
                                    <p>Click para subir imagen</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-lg font-bold mb-4">Estado</h2>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...register('disponible')} className="rounded text-[var(--color-primary-500)]" />
                                <span>Disponible</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...register('destacado')} className="rounded text-[var(--color-primary-500)]" />
                                <span>Destacado</span>
                            </label>
                        </div>
                    </Card>

                    <div className="flex flex-col gap-3">
                        <Button type="submit" loading={saving} size="lg">Given Save</Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
