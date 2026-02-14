'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { appwriteService } from '@/lib/appwrite';
import { PageLoader } from '@/components/ui/Spinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if we have a session
                const user = await appwriteService.getCurrentUser();

                // If on login page and already authenticated, redirect to admin
                if (user && pathname === '/admin/login') {
                    router.replace('/admin');
                    return;
                }

                // If not authenticated and trying to access protected route (anything under /admin except login)
                if (!user && pathname.startsWith('/admin') && pathname !== '/admin/login') {
                    router.replace('/admin/login');
                    return;
                }
            } catch (error) {
                // If error (no session), redirect to login if on protected route
                if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
                    router.replace('/admin/login');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    if (loading) {
        return <PageLoader />;
    }

    return <>{children}</>;
}
