'use client';

import { useEffect, useState, use } from 'react';
import { pedidosService } from '@/services/pedidos.service';
import { client, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import type { Pedido, EstadoPedido } from '@/types';
import { ESTADO_LABELS, ESTADO_COLORS } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const STATES_ORDER: EstadoPedido[] = [
    'nuevo', 'confirmado', 'en_preparacion', 'en_camino', 'entregado',
];

export default function OrderTrackingPage({
    params,
}: {
    params: Promise<{ pedidoId: string }>;
}) {
    const { pedidoId } = use(params);
    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await pedidosService.get(pedidoId);
                setPedido(data);
            } catch (err) {
                console.error('Error loading order:', err);
            } finally {
                setLoading(false);
            }
        };
        load();

        const unsubscribe = client.subscribe(
            `databases.${DATABASE_ID}.collections.${COLLECTION.PEDIDOS}.documents.${pedidoId}`,
            (response) => {
                setPedido(response.payload as unknown as Pedido);
            }
        );

        return () => { unsubscribe(); };
    }, [pedidoId]);

    if (loading) return <PageLoader />;
    if (!pedido) {
        return (
            <div className="max-w-2xl mx-auto px-container py-40 text-center">
                <span className="text-8xl mb-8 block grayscale">❓</span>
                <h1 className="text-display mb-4">No encontrado.</h1>
                <p className="text-[var(--color-text-muted)] mb-10">Parece que el pedido que buscas no existe en nuestra base de datos.</p>
                <Link href="/menu"><Button>Seguir explorando</Button></Link>
            </div>
        );
    }

    const currentIndex = STATES_ORDER.indexOf(pedido.estado as EstadoPedido);
    const isCancelled = pedido.estado === 'cancelado';

    return (
        <div className="bg-[var(--color-bg)] min-h-screen px-container py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Status Hero */}
                <div className="bg-[var(--color-secondary)] p-12 rounded-[40px] text-center mb-16 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-transparent" />
                    </div>

                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-[var(--color-primary)] text-[var(--color-secondary)] mb-8 shadow-2xl rotate-3"
                    >
                        <span className="text-5xl">
                            {pedido.estado === 'entregado' ? '🥂' : pedido.estado === 'en_camino' ? '🚀' : '👨‍🍳'}
                        </span>
                    </motion.div>

                    <h1 className="text-display sm:text-[52px] text-white tracking-tighter mb-4 italic uppercase">
                        {currentIndex >= 4 ? 'DISFRUTA.' : 'ESTAMOS EN ELLO.'}
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-white/40 font-black text-sm tracking-widest uppercase">ID #{pedido.numero_pedido.toUpperCase()}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <Badge estado={pedido.estado as EstadoPedido} size="md" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Timeline Sidebar */}
                    <div className="lg:col-span-12">
                        <div className="bg-white rounded-[40px] p-10 shadow-premium border border-[var(--color-secondary)]/5">
                            <h2 className="text-h3 font-black mb-12 tracking-tighter uppercase border-b-2 border-[var(--color-secondary)]/5 pb-6">Estado del Seguimiento</h2>

                            {!isCancelled ? (
                                <div className="space-y-0 relative pl-4 sm:pl-0">
                                    {STATES_ORDER.map((state, idx) => {
                                        const isActive = idx <= currentIndex;
                                        const isCurrent = idx === currentIndex;

                                        return (
                                            <div key={state} className="flex gap-12 relative pb-12 group last:pb-0">
                                                {/* Vertical Connector */}
                                                {idx < STATES_ORDER.length - 1 && (
                                                    <div className={`absolute left-5 top-10 w-[2px] h-full ${idx < currentIndex ? 'bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]' : 'bg-[var(--color-secondary)]/5'}`} />
                                                )}

                                                {/* Step Visual */}
                                                <motion.div
                                                    animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className={`
                                                        relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-4
                                                        ${isActive ? 'bg-[var(--color-secondary)] border-[var(--color-primary)] text-[var(--color-primary)]' : 'bg-white border-[var(--color-secondary)]/5 text-[var(--color-secondary)]/20'}
                                                    `}
                                                >
                                                    {isActive ? (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : idx + 1}
                                                </motion.div>

                                                <div className="pt-1">
                                                    <h3 className={`text-h3 font-black tracking-tight leading-none ${isActive ? 'text-[var(--color-secondary)]' : 'text-[var(--color-secondary)]/10'}`}>
                                                        {ESTADO_LABELS[state]}
                                                    </h3>
                                                    {isCurrent && (
                                                        <motion.p
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="text-[10px] uppercase font-black tracking-widest text-[var(--color-primary)] mt-3 bg-[var(--color-secondary)] inline-block px-3 py-1 rounded-lg"
                                                        >
                                                            Procesando ahora
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-red-50 rounded-[32px] border-2 border-red-100">
                                    <span className="text-6xl block mb-4">🛑</span>
                                    <h3 className="text-h3 font-black text-red-900 mb-2 uppercase">Pedido Cancelado</h3>
                                    <p className="text-red-700 font-medium">Lamentamos informarte que este pedido no pudo ser completado.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[40px] p-8 shadow-premium border border-[var(--color-secondary)]/5">
                            <h3 className="text-caption font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-6">Información de Pago</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between font-bold">
                                    <span className="text-[var(--color-text-muted)]">Subtotal</span>
                                    <span>${pedido.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span className="text-[var(--color-text-muted)]">Costo Envío</span>
                                    <span>${pedido.envio.toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t-2 border-dashed border-[var(--color-secondary)]/5 flex justify-between items-end">
                                    <span className="text-h3 font-black">TOTAL</span>
                                    <span className="text-h2 font-black text-[var(--color-primary)]">${pedido.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--color-secondary)] p-8 rounded-[40px] shadow-2xl flex flex-col justify-between">
                            <div className="text-white/40 uppercase font-black tracking-widest text-[10px] mb-8">Soporte Express</div>
                            <h3 className="text-white text-h3 font-bold mb-4 tracking-tighter italic">¿Algún inconveniente?</h3>
                            <p className="text-white/60 text-sm mb-10 font-medium">Nuestro equipo está listo para ayudarte en tiempo real.</p>
                            <Button fullWidth variant="primary" size="lg">Contactar Soporte</Button>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <Link href="/menu" className="font-black text-[var(--color-secondary)] uppercase tracking-[0.3em] text-[10px] border-b-2 border-[var(--color-primary)] pb-1 hover:border-[var(--color-secondary)] transition-all">
                        ← Continuar Comprando
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
