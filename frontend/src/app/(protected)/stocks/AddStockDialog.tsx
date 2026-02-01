'use client';

import { useState, useEffect } from 'react';
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

const stockSchema = z.object({
    materialId: z.string().min(1, 'Material is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    location: z.string().optional(),
    batchNumber: z.string().optional(),
    serialNumber: z.string().optional(),
    expiryDate: z.string().optional(),
});

type StockForm = z.infer<typeof stockSchema>;

interface Material {
    _id: string;
    name: string;
}

export function AddStockDialog({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<StockForm>({
        resolver: zodResolver(stockSchema) as any,
    });

    const fetchMaterials = async () => {
        setLoadingMaterials(true);
        try {
            const res = await api.get('/materials');
            setMaterials(res.data);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        } finally {
            setLoadingMaterials(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchMaterials();
        }
    }, [open]);

    const onSubmit = async (data: StockForm) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
            };
            await api.post('/stocks', payload);
            reset();
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to create stock:', error);
            alert('Failed to create stock entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stock
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Stock Entry</DialogTitle>
                    <DialogDescription>
                        Record physical inventory for a material.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Material *</Label>
                        {loadingMaterials ? (
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading materials...
                            </div>
                        ) : (
                            <select
                                {...register('materialId')}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            >
                                <option value="">Select a material</option>
                                {materials.map((material) => (
                                    <option key={material._id} value={material._id}>
                                        {material.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.materialId && <p className="text-red-500 text-xs">{errors.materialId.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input type="number" {...register('quantity')} placeholder="100" />
                            {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input {...register('location')} placeholder="Warehouse A-3" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Batch Number</Label>
                            <Input {...register('batchNumber')} placeholder="BATCH-2024-001" />
                        </div>

                        <div className="space-y-2">
                            <Label>Serial Number</Label>
                            <Input {...register('serialNumber')} placeholder="SN-123456" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input type="date" {...register('expiryDate')} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || loadingMaterials}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Stock
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
