'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/client';
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
import { Loader2, Download, FileText } from 'lucide-react';
import { AddMaterialDialog } from './AddMaterialDialog';
import { useAuth } from '@/context/AuthContext';

interface Material {
    _id: string;
    name: string;
    description?: string;
    type: string;
    dimensions: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    weight?: number;
}

export default function MaterialsPage() {
    const { user } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    const downloadReport = async (type: 'csv' | 'pdf') => {
        try {
            const res = await api.get(`/inventory/reports/materials/${type}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `materials_report.${type}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download report:', error);
            alert('Failed to download report');
        }
    };

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await api.get('/materials');
            setMaterials(res.data);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-light text-zinc-900 tracking-tight">Materials</h1>
                    <p className="text-zinc-500">Define your product catalog.</p>
                </div>
                <div className="flex gap-2">
                    {user?.role === 'ADMIN' && (
                        <>
                            <Button variant="outline" onClick={() => downloadReport('csv')}>
                                <FileText className="h-4 w-4 mr-2" />
                                CSV
                            </Button>
                            <Button variant="outline" onClick={() => downloadReport('pdf')}>
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                            </Button>
                        </>
                    )}
                    <AddMaterialDialog onSuccess={fetchMaterials} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Materials</CardTitle>
                    <CardDescription>Definitions of items you carry.</CardDescription>
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
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Weight (kg)</TableHead>
                                    <TableHead>Dimensions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {materials.map((m) => (
                                    <TableRow key={m._id}>
                                        <TableCell className="font-medium">{m.name}</TableCell>
                                        <TableCell className="text-zinc-500 text-sm">{m.description || '-'}</TableCell>
                                        <TableCell>{m.type}</TableCell>
                                        <TableCell className="text-zinc-500">{m.weight ? `${m.weight} kg` : '-'}</TableCell>
                                        <TableCell className="text-zinc-500 text-sm">
                                            {m.dimensions?.length}x{m.dimensions?.width}x{m.dimensions?.height} {m.dimensions?.unit}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {materials.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                            No materials defined.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
