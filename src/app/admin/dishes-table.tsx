
'use client';

import { useState } from 'react';
import type { Dish, DishApprovalStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';
import { deleteDishByAdmin } from '@/lib/services/admin-actions';
import { MoreHorizontal, Trash2, Search, CheckCircle, XCircle, AlertTriangle, Info, FileDown } from 'lucide-react';
import { exportDishesToPDF } from '@/lib/pdf-generator';

export default function DishesTable({ initialDishes }: { initialDishes: Dish[] }) {
    const { user: adminUser } = useAuth();
    const { toast } = useToast();
    const [dishes, setDishes] = useState(initialDishes);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const handleDeleteDish = async (dishIdToDelete: string) => {
        if (!adminUser) return;
        const result = await deleteDishByAdmin(adminUser.id, adminUser.name, dishIdToDelete);
        if (result.success) {
            toast({ title: 'Dish Deleted', description: 'The dish has been removed.' });
            setDishes(prev => prev.filter(p => p.id !== dishIdToDelete));
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };
    
    const filteredDishes = dishes.filter(p => {
        if (!searchTerm) return true;
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const paginatedDishes = filteredDishes.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
    
    const handleExport = () => {
        exportDishesToPDF(filteredDishes);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Dish Management</CardTitle>
                        <CardDescription>A list of all dishes on the platform.</CardDescription>
                    </div>
                    <Button onClick={handleExport} variant="outline" size="sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 max-w-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by dish name..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setPage(1);
                            }}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[80px] sm:table-cell">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedDishes.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="hidden sm:table-cell">
                                    <Image
                                        alt={p.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={p.images?.[0] || 'https://placehold.co/64x64.png'}
                                        width="64"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Link href={`/dish/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{p.category}</Badge>
                                </TableCell>
                                <TableCell>৳{p.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" className="w-full justify-start p-2 h-auto font-normal text-destructive hover:text-destructive flex items-center gap-2" disabled={adminUser?.role !== 'admin'}>
                                                        <Trash2 className="h-4 w-4" /> Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the dish.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteDish(p.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
