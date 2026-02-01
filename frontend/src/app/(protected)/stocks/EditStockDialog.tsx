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

const stockSchema = z.object({
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    location: z.string().optional(),
    batchNumber: z.string().optional(),
    serialNumber: z.string().optional(),
    expiryDate: z.string().optional(),
});

type StockForm = z.infer<typeof stockSchema>;

interface Stock {
    _id: string;
    materialId: {
        _id: string;
        name: string;
    };
    quantity: number;
    location: string;
    batchNumber: string;
    serialNumber: string;
    expiryDate?: string;
}

interface EditStockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stock: Stock | null;
    onSuccess: () => void;
}

export function EditStockDialog({ open, onOpenChange, stock, onSuccess }: EditStockDialogProps) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StockForm>({
        resolver: zodResolver(stockSchema) as any,
    });

    useEffect(() => {
        if (stock) {
            reset({
                quantity: stock.quantity,
                location: stock.location || '',
                batchNumber: stock.batchNumber || '',
                serialNumber: stock.serialNumber || '',
                expiryDate: stock.expiryDate ? new Date(stock.expiryDate).toISOString().split('T')[0] : '',
            });
        }
    }, [stock, reset]);

    const onSubmit = async (data: StockForm) => {
        if (!stock) return;

        try {
            const payload = {
                ...data,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
            };
            await api.patch(`/stocks/${stock._id}`, payload);
            onSuccess();
        } catch (error) {
            console.error('Failed to update stock:', error);
            alert('Failed to update stock');
        }
    };

    if (!stock) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Stock Entry</DialogTitle>
                    <DialogDescription>
                        Update inventory details for {stock.materialId?.name}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Material (locked)</Label>
                        <Input
                            value={stock.materialId?.name || 'Unknown'}
                            disabled
                            className="bg-zinc-50 text-zinc-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input type="number" {...register('quantity')} />
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
