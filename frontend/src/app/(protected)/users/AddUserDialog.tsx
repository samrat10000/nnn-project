'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';

const userSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'WAREHOUSE_WORKER', 'VIEWER']),
});

type UserForm = z.infer<typeof userSchema>;

export function AddUserDialog({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
    });

    const onSubmit = async (data: UserForm) => {
        setLoading(true);
        try {
            await api.post('/users', data);
            reset();
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to create user');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new team member and assign their role.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input {...register('name')} placeholder="John Doe" />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input type="email" {...register('email')} placeholder="john@example.com" />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Password *</Label>
                        <Input type="password" {...register('password')} placeholder="••••••••" />
                        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Role *</Label>
                        <select
                            {...register('role')}
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        >
                            <option value="">Select a role</option>
                            <option value="ADMIN">ADMIN - Full control</option>
                            <option value="WAREHOUSE_WORKER">WAREHOUSE_WORKER - Manage stock</option>
                            <option value="VIEWER">VIEWER - Read-only access</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
