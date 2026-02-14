'use client';

import { useEffect, useState } from 'react';
import { notificacionesService } from '@/services/notificaciones.service';
import { useNotificationStore } from '@/hooks/stores/useNotificationStore';
import type { Notificacion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TIPO_ICONS: Record<string, string> = {
    pedido_nuevo: '🛒',
    estado_pedido: '📦',
    stock_bajo: '⚠️',
    default: '🔔',
};

export default function NotificacionesPage() {
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const { setUnreadCount } = useNotificationStore();

    const loadData = async () => {
        try {
            // Using 'admin' as placeholder user ID
            const data = await notificacionesService.list('admin');
            setNotifications(data);
            const unread = data.filter((n) => !n.leida).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificacionesService.markAsRead(id);
            loadData();
        } catch {
            toast.error('Error');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificacionesService.markAllAsRead('admin');
            toast.success('Todas marcadas como leídas');
            loadData();
        } catch {
            toast.error('Error');
        }
    };

    if (loading) return <PageLoader />;

    const unreadCount = notifications.filter((n) => !n.leida).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-secondary-900)]">Notificaciones</h1>
                    <p className="text-sm text-[var(--color-secondary-500)]">
                        {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                        Marcar todas como leídas
                    </Button>
                )}
            </div>

            <Card padding="none">
                <AnimatePresence>
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-[var(--color-secondary-400)]">
                            <p className="text-4xl mb-2">🔔</p>
                            <p>No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--color-secondary-50)]">
                            {notifications.map((notif) => (
                                <motion.div
                                    key={notif.$id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-[var(--color-secondary-50)] ${!notif.leida ? 'bg-[var(--color-primary-50)]/50' : ''
                                        }`}
                                    onClick={() => !notif.leida && handleMarkAsRead(notif.$id)}
                                >
                                    <span className="text-xl mt-0.5">
                                        {TIPO_ICONS[notif.tipo] || TIPO_ICONS.default}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <p className={`text-sm ${!notif.leida ? 'font-semibold text-[var(--color-secondary-900)]' : 'text-[var(--color-secondary-700)]'}`}>
                                                {notif.titulo}
                                            </p>
                                            {!notif.leida && (
                                                <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] mt-1.5 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-[var(--color-secondary-500)] mt-0.5">
                                            {notif.mensaje}
                                        </p>
                                        <p className="text-xs text-[var(--color-secondary-400)] mt-1">
                                            {new Date(notif.fecha).toLocaleString('es')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}
