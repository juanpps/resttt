'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { Suspense } from 'react';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm"
            >
                <div className="text-center mb-10">
                    <div className="inline-block p-4 bg-[var(--color-primary)] rounded-2xl mb-4 rotate-3">
                        <span className="text-3xl">🍔</span>
                    </div>
                    <h1 className="text-h1 text-[var(--color-secondary)] mb-2">Bienvenido</h1>
                    <p className="text-[var(--color-text-muted)]">Inicia sesión para una mejor experiencia</p>
                </div>

                <div className="mb-8">
                    <LoginForm onSuccess={() => router.push(redirect)} />
                </div>

                <div className="text-center space-y-4">
                    <p className="text-caption text-[var(--color-text-muted)]">
                        ¿No tienes cuenta? <span className="text-[var(--color-primary)] font-bold cursor-pointer">Regístrate</span>
                    </p>
                    <Link href={redirect} className="block text-caption text-[var(--color-secondary)] underline font-medium">
                        Continuar como invitado
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function ClientLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-secondary)]">Cargando...</div>}>
            <LoginContent />
        </Suspense>
    );
}
