import { Sidebar } from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RealtimeNotifications } from '@/components/admin/RealtimeNotifications';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <RealtimeNotifications />
            <div className="min-h-screen bg-[var(--color-secondary-50)]">
                <Sidebar />
                <main className="ml-64 p-6">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
