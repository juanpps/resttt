'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-secondary)] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm"
            >
                <div className="text-center mb-8">
                    <h1 className="text-display text-[var(--color-primary)] mb-2">JM Admin</h1>
                    <p className="text-[var(--color-text-muted)]">Control de Operaciones</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-premium">
                    <LoginForm onSuccess={() => router.push('/admin')} />
                </div>

                <p className="text-center text-[var(--color-text-muted)] text-caption mt-8">
                    Acceso restringido a personal autorizado.
                </p>
            </motion.div>
        </div>
    );
}
