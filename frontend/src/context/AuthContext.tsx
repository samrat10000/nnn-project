'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/client';

type UserRole = 'ADMIN' | 'WAREHOUSE_WORKER' | 'VIEWER';

interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    permissions?: string[];
}

interface AuthContextType {
    user: User | null;
    login: (token: string, refreshToken: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check initial session
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData && userData !== 'undefined') {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('Failed to parse user data:', e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string, refreshToken: string, userData: any) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
