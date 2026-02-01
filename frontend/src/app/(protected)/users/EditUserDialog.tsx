'use client';

import { useEffect } from 'react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const userSchema = z.object({
    role: z.enum(['ADMIN', 'WAREHOUSE_WORKER', 'VIEWER']),
});

type UserForm = z.infer<typeof userSchema>;

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'WAREHOUSE_WORKER' | 'VIEWER';
}

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onSuccess: () => void;
}

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
    });

    useEffect(() => {
        if (user) {
            reset({
                role: user.role,
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: UserForm) => {
        if (!user) return;

        try {
            await api.patch(`/users/${user._id}`, data);
            onSuccess();
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user role');
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit User Role</DialogTitle>
                    <DialogDescription>
                        Update role for {user.name}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={user.name}
                            disabled
                            className="bg-zinc-50 text-zinc-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            value={user.email}
                            disabled
                            className="bg-zinc-50 text-zinc-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Role *</Label>
                        <select
                            {...register('role')}
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        >
                            <option value="ADMIN">ADMIN - Full control</option>
                            <option value="WAREHOUSE_WORKER">WAREHOUSE_WORKER - Manage stock</option>
                            <option value="VIEWER">VIEWER - Read-only access</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
