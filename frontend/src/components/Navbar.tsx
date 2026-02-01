'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Package, Layers, Users } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for merging classes, or I can implement inline

export function Navbar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/materials', label: 'Materials', icon: Package },
        { href: '/stocks', label: 'Stock', icon: Layers },
        ...(user?.role === 'ADMIN' ? [{ href: '/users', label: 'Users', icon: Users }] : []),
    ];

    return (
        <nav className="border-b bg-white">
            <div className="flex h-16 items-center px-4 max-w-6xl mx-auto justify-between">
                <div className="flex items-center gap-6">
                    <div className="font-semibold text-lg tracking-tight">MiniInventory</div>
                    <div className="flex items-center gap-4">
                        {links.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center text-sm font-medium transition-colors hover:text-black",
                                    pathname === href ? "text-black" : "text-zinc-500"
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-500">
                        {user?.name || user?.email}
                    </span>
                    <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </nav>
    );
}
