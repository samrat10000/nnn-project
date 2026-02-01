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
import { Loader2, Pencil, Trash2, Download, FileText } from 'lucide-react';
import { AddStockDialog } from './AddStockDialog';
import { EditStockDialog } from './EditStockDialog';
import { useAuth } from '@/context/AuthContext';

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

export default function StocksPage() {
    const { user } = useAuth();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingStock, setEditingStock] = useState<Stock | null>(null);

    const downloadReport = async (type: 'csv' | 'pdf') => {
        try {
            const res = await api.get(`/inventory/reports/stocks/${type}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `stocks_report.${type}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download report:', error);
            alert('Failed to download report');
        }
    };

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/stocks');
            setStocks(res.data);
        } catch (error) {
            console.error('Failed to fetch stocks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this stock entry?')) return;

        try {
            await api.delete(`/stocks/${id}`);
            fetchStocks();
        } catch (error) {
            console.error('Failed to delete stock:', error);
            alert('Failed to delete stock');
        }
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Role-based permissions
    const canModifyStock = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE_WORKER';
    const canDeleteStock = user?.role === 'ADMIN';

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-light text-zinc-900 tracking-tight">Stock</h1>
                    <p className="text-zinc-500">Manage physical inventory.</p>
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
                    {canModifyStock && <AddStockDialog onSuccess={fetchStocks} />}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory Stock</CardTitle>
                    <CardDescription>Track quantities, batches, and locations.</CardDescription>
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
                                    <TableHead>Material</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Batch #</TableHead>
                                    <TableHead>Serial #</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stocks.map((stock) => (
                                    <TableRow key={stock._id}>
                                        <TableCell className="font-medium">
                                            {stock.materialId?.name || 'Unknown Material'}
                                        </TableCell>
                                        <TableCell>{stock.quantity}</TableCell>
                                        <TableCell className="text-zinc-500">{stock.location || 'N/A'}</TableCell>
                                        <TableCell className="text-zinc-500">{stock.batchNumber || 'N/A'}</TableCell>
                                        <TableCell className="text-zinc-500">{stock.serialNumber || 'N/A'}</TableCell>
                                        <TableCell className="text-zinc-500">{formatDate(stock.expiryDate)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {canModifyStock && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingStock(stock)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDeleteStock && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(stock._id)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {stocks.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                                            No stock entries found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <EditStockDialog
                open={!!editingStock}
                onOpenChange={(open: boolean) => !open && setEditingStock(null)}
                stock={editingStock}
                onSuccess={() => {
                    fetchStocks();
                    setEditingStock(null);
                }}
            />
        </>
    );
}
