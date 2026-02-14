'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/hooks/stores/useCartStore';
import { pedidosService } from '@/services/pedidos.service';
import { promocionesService } from '@/services/promociones.service';
import { appwriteService } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { checkoutSchema } from '@/lib/validations';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getSubtotal, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [form, setForm] = useState({
        nombre: '',
        telefono: '',
        direccion: '',
        metodo_pago: 'efectivo',
        notas: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const checkUser = async () => {
            try {
                const user = await appwriteService.getCurrentUser();
                if (user) {
                    setUserId(user.$id);
                    setForm(prev => ({ ...prev, nombre: user.name }));
                }
            } finally {
                setCheckingAuth(false);
            }
        };
        checkUser();
    }, []);

    const subtotal = getSubtotal();
    const impuestos = Math.round(subtotal * 0.08);
    const total = subtotal + impuestos;

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = checkoutSchema.safeParse(form);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.error.issues.forEach((err: any) => {
                if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
            });
            setErrors(fieldErrors);
            setLoading(false);
            return;
        }

        try {
            const promos = await promocionesService.listActive();
            const { discount } = promocionesService.calculateDiscount(items, promos);

            const pedido = await pedidosService.createOrder(
                items,
                discount,
                form.direccion,
                form.metodo_pago as any,
                userId,
                form.direccion.length > 0
            );

            clearCart();
            toast.success('¡Pedido realizado con éxito!');
            router.push(`/pedido/${pedido.$id}`);
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Error al crear el pedido. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && !loading) {
        if (typeof window !== 'undefined') router.push('/menu');
        return null;
    }

    return (
        <div className="bg-[var(--color-bg)] min-h-screen px-container py-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <Link href="/carrito" className="text-caption font-black text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] uppercase tracking-widest flex items-center gap-2 mb-4">
                        ← Volver al carrito
                    </Link>
                    <h1 className="text-display tracking-tighter">Finalizar pedido.</h1>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Side: Forms */}
                    <div className="lg:col-span-7 space-y-12">

                        {/* Auth Bridge */}
                        <AnimatePresence>
                            {!checkingAuth && !userId && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-[var(--color-primary)] p-8 rounded-[32px] overflow-hidden shadow-premium"
                                >
                                    <h2 className="text-h3 font-black text-[var(--color-secondary)] mb-2">¿Ya tienes cuenta?</h2>
                                    <p className="text-[var(--color-secondary)]/70 font-medium mb-6">Inicia sesión para ganar puntos y una entrega más rápida.</p>
                                    <Link href="/login?redirect=/checkout">
                                        <Button variant="secondary" size="md">Identifícate ahora</Button>
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Delivery Info */}
                        <section>
                            <h2 className="text-h3 font-black mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center text-xs">01</span>
                                Entrega y Contacto
                            </h2>
                            <div className="space-y-6">
                                <Input
                                    label="Nombre Completo"
                                    placeholder="Ej. Juan Pérez"
                                    value={form.nombre}
                                    onChange={(e) => handleChange('nombre', e.target.value)}
                                    error={errors.nombre}
                                />
                                <Input
                                    label="Teléfono Móvil"
                                    placeholder="+57 321 000 0000"
                                    value={form.telefono}
                                    onChange={(e) => handleChange('telefono', e.target.value)}
                                    error={errors.telefono}
                                />
                                <Input
                                    label="Dirección de Envío"
                                    placeholder="Calle 123 # 45 - 67, Apto 101"
                                    value={form.direccion}
                                    onChange={(e) => handleChange('direccion', e.target.value)}
                                    error={errors.direccion}
                                />
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section>
                            <h2 className="text-h3 font-black mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center text-xs">02</span>
                                Método de Pago
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: 'efectivo', label: 'Efectivo', icon: '💵' },
                                    { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
                                    { id: 'tarjeta', label: 'Tarjeta', icon: '💳' },
                                ].map((method) => (
                                    <label
                                        key={method.id}
                                        className={`
                                            cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3
                                            ${form.metodo_pago === method.id
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-premium'
                                                : 'border-[var(--color-secondary)]/5 hover:border-[var(--color-secondary)]/10'}
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="metodo_pago"
                                            value={method.id}
                                            className="hidden"
                                            onChange={(e) => handleChange('metodo_pago', e.target.value)}
                                        />
                                        <span className="text-3xl">{method.icon}</span>
                                        <span className="font-bold text-sm">{method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Extras */}
                        <section>
                            <h2 className="text-h3 font-black mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center text-xs">03</span>
                                Notas Finales
                            </h2>
                            <Textarea
                                label="Instrucciones para el Chef o Repartidor"
                                placeholder="Ej. Sin cebolla, timbre averiado..."
                                value={form.notas}
                                onChange={(e) => handleChange('notas', e.target.value)}
                            />
                        </section>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-[var(--color-secondary)]/5 sticky top-32 overflow-hidden">
                            {/* Decorative header */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-primary)]" />

                            <h2 className="text-h3 font-black mb-8 tracking-tighter uppercase">Tu Selección.</h2>

                            <div className="space-y-4 mb-10 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.producto.$id} className="flex justify-between items-center py-2">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[var(--color-secondary)]">{item.cantidad}x {item.producto.nombre}</span>
                                            <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest mt-0.5">JM Signature</span>
                                        </div>
                                        <span className="font-black">${(item.producto.precio * item.cantidad).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-8 border-t-2 border-dashed border-[var(--color-secondary)]/5">
                                <div className="flex justify-between text-sm font-medium text-[var(--color-text-muted)]">
                                    <span>Subtotal base</span>
                                    <span>${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-[var(--color-text-muted)]">
                                    <span>Impuestos (8%)</span>
                                    <span>${impuestos.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-6">
                                    <span className="text-h3 font-black">TOTAL</span>
                                    <span className="text-h2 font-black text-[var(--color-secondary)] animate-scale-in">
                                        ${total.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                className="mt-10"
                                loading={loading}
                            >
                                Confirmar y Pagar
                            </Button>

                            <p className="mt-6 text-center text-[10px] uppercase tracking-widest font-black text-[var(--color-text-muted)] opacity-40">
                                Transacción Segura by JM Resto
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
