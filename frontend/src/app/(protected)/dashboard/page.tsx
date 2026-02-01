'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, Package, Warehouse, MapPin, ArrowRight } from 'lucide-react';

interface Material {
    _id: string;
    name: string;
}

interface Stock {
    _id: string;
    materialId: {
        _id: string;
        name: string;
    };
    quantity: number;
    location: string;
}

interface StockByMaterial {
    materialId: string;
    materialName: string;
    totalQuantity: number;
    locationCount: number;
    locations: string[];
}

export default function DashboardPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [materialsRes, stocksRes] = await Promise.all([
                api.get('/materials'),
                api.get('/stocks'),
            ]);
            setMaterials(materialsRes.data);
            setStocks(stocksRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate aggregated stock by material
    const stockByMaterial: StockByMaterial[] = Object.values(
        stocks.reduce((acc, stock) => {
            const materialId = stock.materialId?._id;
            const materialName = stock.materialId?.name || 'Unknown';

            if (!materialId) return acc;

            if (!acc[materialId]) {
                acc[materialId] = {
                    materialId,
                    materialName,
                    totalQuantity: 0,
                    locationCount: 0,
                    locations: [],
                };
            }

            acc[materialId].totalQuantity += stock.quantity;
            if (stock.location && !acc[materialId].locations.includes(stock.location)) {
                acc[materialId].locations.push(stock.location);
            }

            return acc;
        }, {} as Record<string, StockByMaterial>)
    ).map(item => ({
        ...item,
        locationCount: item.locations.length,
    }));

    // Calculate summary stats
    const totalMaterials = materials.length;
    const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);
    const uniqueLocations = new Set(stocks.map(s => s.location).filter(Boolean)).size;

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-light text-zinc-900 tracking-tight">Dashboard</h1>
                <p className="text-zinc-500">Warehouse overview and analytics</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500">
                                    Total Materials
                                </CardTitle>
                                <Package className="h-4 w-4 text-zinc-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalMaterials}</div>
                                <p className="text-xs text-zinc-500 mt-1">Product definitions</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500">
                                    Total Stock
                                </CardTitle>
                                <Warehouse className="h-4 w-4 text-zinc-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalStock}</div>
                                <p className="text-xs text-zinc-500 mt-1">Units across all materials</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500">
                                    Locations
                                </CardTitle>
                                <MapPin className="h-4 w-4 text-zinc-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{uniqueLocations}</div>
                                <p className="text-xs text-zinc-500 mt-1">Warehouse locations</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stock by Material */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Stock by Material</CardTitle>
                            <CardDescription>Aggregated inventory across all locations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stockByMaterial.length === 0 ? (
                                <div className="text-center py-8 text-zinc-500">
                                    No stock entries found. Start by adding materials and stock.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Total Quantity</TableHead>
                                            <TableHead>Locations</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockByMaterial.map((item) => (
                                            <TableRow key={item.materialId}>
                                                <TableCell className="font-medium">
                                                    {item.materialName}
                                                </TableCell>
                                                <TableCell>{item.totalQuantity}</TableCell>
                                                <TableCell className="text-zinc-500">
                                                    {item.locationCount} {item.locationCount === 1 ? 'location' : 'locations'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href="/stocks">
                                                        <Button variant="ghost" size="sm">
                                                            View Details
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/materials">
                            <Card className="hover:bg-zinc-50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        Manage Materials
                                        <Package className="h-5 w-5 text-zinc-400" />
                                    </CardTitle>
                                    <CardDescription>
                                        Define and manage product specifications
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href="/stocks">
                            <Card className="hover:bg-zinc-50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        Manage Stock
                                        <Warehouse className="h-5 w-5 text-zinc-400" />
                                    </CardTitle>
                                    <CardDescription>
                                        Track inventory, batches, and locations
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>
                </>
            )}
        </>
    );
}
