'use client';

import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, user, loading } = useAuth(); // Assuming useAuth has a 'loading' state now or usually user is null initially
    const router = useRouter();

    useEffect(() => {
        // If not authenticated and not loading (implicit check), redirect
        // Ideally AuthContext should expose 'loading'
        if (!isAuthenticated && !user) {
            const token = localStorage.getItem('token');
            if (!token) router.push('/login');
        }
    }, [isAuthenticated, user, router]);

    // Use centralized loading state from AuthContext to avoid hydration mismatch
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <Navbar />
            <main className="p-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
