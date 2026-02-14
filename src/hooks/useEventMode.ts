'use client';

import { useEffect, useState } from 'react';
import { eventosService } from '@/services/eventos.service';
import type { Evento } from '@/types';

export function useEventMode() {
    const [activeEvent, setActiveEvent] = useState<Evento | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    useEffect(() => {
        const checkEvent = async () => {
            try {
                const event = await eventosService.getActive();
                setActiveEvent(event);

                if (event) {
                    // Apply CSS variables
                    document.documentElement.style.setProperty('--event-primary', event.color_tema);
                    document.documentElement.style.setProperty('--event-banner-bg', event.color_tema);
                } else {
                    // Reset to defaults
                    document.documentElement.style.removeProperty('--event-primary');
                    document.documentElement.style.removeProperty('--event-banner-bg');
                }
            } catch (error) {
                console.error('Error checking event mode:', error);
            }
        };

        checkEvent();
        const interval = setInterval(checkEvent, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!activeEvent) return;

        const updateCountdown = () => {
            const end = new Date(activeEvent.fecha_fin).getTime();
            const now = Date.now();
            const diff = end - now;

            if (diff <= 0) {
                setTimeRemaining('Finalizado');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
            } else {
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [activeEvent]);

    return { activeEvent, timeRemaining };
}
