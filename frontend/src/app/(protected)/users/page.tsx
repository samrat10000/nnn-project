'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { AddUserDialog } from './AddUserDialog';
import { EditUserDialog } from './EditUserDialog';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'WAREHOUSE_WORKER' | 'VIEWER';
    createdAt: string;
}

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Redirect if not ADMIN
    useEffect(() => {
        if (currentUser && currentUser.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [currentUser, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, userName: string) => {
        if (currentUser?._id === id) {
            alert('You cannot delete yourself!');
            return;
        }

        if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    useEffect(() => {
        if (currentUser?.role === 'ADMIN') {
            fetchUsers();
        }
    }, [currentUser]);

    const getRoleBadge = (role: string) => {
        const styles = {
            ADMIN: 'bg-blue-100 text-blue-800',
            WAREHOUSE_WORKER: 'bg-green-100 text-green-800',
            VIEWER: 'bg-zinc-100 text-zinc-800',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${styles[role as keyof typeof styles]}`}>
                {role}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (currentUser?.role !== 'ADMIN') {
        return null; // Will redirect
    }

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-light text-zinc-900 tracking-tight">Users</h1>
                    <p className="text-zinc-500">Manage team members and permissions.</p>
                </div>
                <AddUserDialog onSuccess={fetchUsers} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>View and manage user accounts and roles.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8 text-zinc-400">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-zinc-500">{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell className="text-zinc-500">{formatDate(user.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingUser(user)}
                                                    disabled={currentUser._id === user._id}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(user._id, user.name)}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    disabled={currentUser._id === user._id}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <EditUserDialog
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                user={editingUser}
                onSuccess={() => {
                    fetchUsers();
                    setEditingUser(null);
                }}
            />
        </>
    );
}
