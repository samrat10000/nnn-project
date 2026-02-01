'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterValues) => {
        setLoading(true);
        setError('');
        try {
            // 1. Register
            await api.post('/auth/register', data);

            // 2. Auto-login after registration
            const res = await api.post('/auth/login', {
                email: data.email,
                password: data.password,
            });

            // Decode token
            const base64Url = res.data.access_token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decoded = JSON.parse(jsonPayload);

            const user = {
                _id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
                name: data.name,
                createdAt: new Date().toISOString(),
                permissions: [],
                refreshTokenHash: ''
            };
            login(res.data.access_token, res.data.refresh_token, user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50/50 px-4">
            <Card className="w-full max-w-md border-zinc-200 shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in zoom-in-95">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-light tracking-tight text-zinc-900">
                        Create an account
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        Join the inventory system today
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-600 font-medium">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                className="bg-zinc-50 border-zinc-200 focus:ring-zinc-900 focus:border-zinc-900"
                                {...register('name')}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-600 font-medium">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="intern@stashpro.com"
                                className="bg-zinc-50 border-zinc-200 focus:ring-zinc-900 focus:border-zinc-900"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-600 font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="bg-zinc-50 border-zinc-200 focus:ring-zinc-900 focus:border-zinc-900"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <p>{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Get Started'}
                        </Button>

                        <div className="text-center text-sm text-zinc-500 mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="underline hover:text-zinc-900 transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
