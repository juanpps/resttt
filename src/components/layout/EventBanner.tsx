'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEventMode } from '@/hooks/useEventMode';

export function EventBanner() {
    const { activeEvent, timeRemaining } = useEventMode();

    return (
        <AnimatePresence>
            {activeEvent && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full overflow-hidden"
                    style={{ backgroundColor: activeEvent.color_tema }}
                >
                    <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between text-white text-sm">
                        <div className="flex items-center gap-3">
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-lg"
                            >
                                🎉
                            </motion.span>
                            <span className="font-medium">{activeEvent.nombre}</span>
                            {activeEvent.descripcion && (
                                <span className="hidden md:inline text-white/80">
                                    — {activeEvent.descripcion}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 font-mono font-bold">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timeRemaining}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
