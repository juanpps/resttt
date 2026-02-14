'use client';

import { useEffect } from 'react';
import { client, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import toast from 'react-hot-toast';

export function RealtimeNotifications() {
    useEffect(() => {
        console.log('Subscribe to Realtime Orders...');
        const unsubscribe = client.subscribe(
            `databases.${DATABASE_ID}.collections.${COLLECTION.PEDIDOS}.documents`,
            (response) => {
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    const payload = response.payload as any;
                    toast.success(`¡Nuevo Pedido #${payload.numero_pedido}!`, {
                        duration: 5000,
                        position: 'top-right',
                        icon: '🔔',
                        style: {
                            background: '#ffe666',
                            color: '#1a1500',
                            fontWeight: 'bold',
                        },
                    });

                    // Play sound
                    const audio = new Audio('/notification.mp3'); // Ensure this file exists or use a base64 string/link
                    audio.play().catch(e => console.error('Audio play failed', e));
                }
            }
        );

        return () => {
            unsubscribe();
        };
    }, []);

    return null; // Component doesn't render anything visible
}
