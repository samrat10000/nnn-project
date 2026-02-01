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

const materialSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    type: z.string().min(1, 'Type is required'),
    weight: z.coerce.number().min(0, 'Must be positive').optional(),
    length: z.coerce.number().min(0, 'Must be positive'),
    width: z.coerce.number().min(0, 'Must be positive'),
    height: z.coerce.number().min(0, 'Must be positive'),
    unit: z.string().default('cm'),
});

type MaterialForm = z.infer<typeof materialSchema>;

export function AddMaterialDialog({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<MaterialForm>({
        resolver: zodResolver(materialSchema) as any,
        defaultValues: {
            unit: 'cm',
            type: 'FINISHED_GOOD'
        }
    });

    const onSubmit = async (data: MaterialForm) => {
        setLoading(true);
        try {
            await api.post('/materials', {
                name: data.name,
                description: data.description,
                type: data.type,
                weight: data.weight,
                dimensions: {
                    length: data.length,
                    width: data.width,
                    height: data.height,
                    unit: data.unit,
                }
            });
            reset();
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to create material:', error);
            alert('Failed to create material');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Material
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Material</DialogTitle>
                    <DialogDescription>
                        Define a new product type/material.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Material Name</Label>
                        <Input {...register('name')} placeholder="e.g. Steel Pipe 20mm" />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input {...register('description')} placeholder="Optional description" />
                    </div>

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Input {...register('type')} placeholder="e.g. RAW or FINISHED" />
                        {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input type="number" step="0.01" {...register('weight')} placeholder="Optional" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-2">
                            <Label>Length</Label>
                            <Input type="number" {...register('length')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Width</Label>
                            <Input type="number" {...register('width')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Height</Label>
                            <Input type="number" {...register('height')} />
                        </div>
                    </div>
                    {errors.length && <p className="text-red-500 text-xs">Dimensions required</p>}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Definition
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
