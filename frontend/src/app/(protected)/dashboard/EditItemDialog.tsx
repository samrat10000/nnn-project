'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(2),
    quantity: z.coerce.number().min(0),
    price: z.coerce.number().min(0),
});

interface EditItemDialogProps {
    item: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditItemDialog({ item, open, onOpenChange, onSuccess }: EditItemDialogProps) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (item) {
            setValue('name', item.name);
            setValue('quantity', item.quantity);
            setValue('price', item.price);
        }
    }, [item, setValue]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await api.patch(`/inventory/${item._id}`, data);
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            console.error(err);
            alert('Failed to update item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Inventory Item</DialogTitle>
                    <DialogDescription>
                        Make changes to the item here. Click save when done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">
                            Name
                        </Label>
                        <Input id="edit-name" className="col-span-3" {...register('name')} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-quantity" className="text-right">
                            Quantity
                        </Label>
                        <Input
                            id="edit-quantity"
                            type="number"
                            className="col-span-3"
                            {...register('quantity')}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-price" className="text-right">
                            Price
                        </Label>
                        <Input
                            id="edit-price"
                            type="number"
                            className="col-span-3"
                            {...register('price')}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
