'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { configuracionService, type Configuracion } from '@/services/configuracion.service';
import toast from 'react-hot-toast';

const schema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    direccion: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function ConfiguracionPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        const load = async () => {
            try {
                const config = await configuracionService.get(); // Should be import * as configuracionService
                if (config) {
                    reset({
                        nombre: config.nombre,
                        direccion: config.direccion,
                        telefono: config.telefono,
                        email: config.email,
                        logo_url: config.logo_url,
                    });
                }
            } catch (error) {
                console.error('Error loading config:', error);
                toast.error('Error al cargar la configuración');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [reset]);

    const onSubmit = async (data: FormValues) => {
        setSaving(true);
        try {
            await configuracionService.update(data);
            toast.success('Configuración guardada');
        } catch (error) {
            console.error('Error saving config:', error);
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-[var(--color-secondary-900)] mb-6">
                Configuración del Restaurante
            </h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-secondary-700)] mb-1">
                                Nombre del Restaurante
                            </label>
                            <Input {...register('nombre')} placeholder="Ej: JM Restaurant" />
                            {errors.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-secondary-700)] mb-1">
                                    Teléfono
                                </label>
                                <Input {...register('telefono')} placeholder="+57 300 123 4567" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-secondary-700)] mb-1">
                                    Email de Contacto
                                </label>
                                <Input {...register('email')} placeholder="contacto@restaurante.com" />
                                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-secondary-700)] mb-1">
                                Dirección Física
                            </label>
                            <Input {...register('direccion')} placeholder="Calle 123 #45-67" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-secondary-700)] mb-1">
                                URL del Logo
                            </label>
                            <Input {...register('logo_url')} placeholder="https://..." />
                            {errors.logo_url && <p className="text-sm text-red-500 mt-1">{errors.logo_url.message}</p>}
                            <p className="text-xs text-[var(--color-secondary-500)] mt-1">
                                * Próximamente: subida de imágenes directa.
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    );
}
