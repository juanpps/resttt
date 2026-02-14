'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import { appwriteService } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { z } from 'zod';

type LoginData = z.infer<typeof loginSchema>;

interface LoginFormProps {
    onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginData) => {
        setLoading(true);
        try {
            await appwriteService.login(data.email, data.password);
            toast.success('¡Bienvenido de nuevo!');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Login error:', error);
            if (error?.type === 'user_invalid_credentials') {
                toast.error('Email o contraseña incorrectos');
            } else {
                toast.error('Ocurrió un error al iniciar sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="tu@email.com"
                        error={errors.email?.message}
                        {...register('email')}
                    />
                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register('password')}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-button font-bold text-lg rounded-xl shadow-premium hover:shadow-premium-hover transition-all"
                    loading={loading}
                >
                    Iniciar Sesión
                </Button>
            </form>
        </motion.div>
    );
}
