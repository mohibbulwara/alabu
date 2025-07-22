
'use client';

import { useState } from 'react';
import type { Product, ProductApprovalStatus } from '@/types';
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
import { deleteProductByAdmin } from '@/lib/services/admin-actions';
import { MoreHorizontal, Trash2, Search, CheckCircle, XCircle, AlertTriangle, Info, FileDown } from 'lucide-react';
import { exportProductsToPDF } from '@/lib/pdf-generator';

export default function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
    const { user: adminUser } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const handleDeleteProduct = async (productIdToDelete: string) => {
        if (!adminUser) return;
        const result = await deleteProductByAdmin(adminUser.id, adminUser.name, productIdToDelete);
        if (result.success) {
            toast({ title: 'Product Deleted', description: 'The product has been removed.' });
            setProducts(prev => prev.filter(p => p.id !== productIdToDelete));
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };
    
    const filteredProducts = products.filter(p => {
        if (!searchTerm) return true;
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    const handleExport = () => {
        exportProductsToPDF(filteredProducts);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Product Management</CardTitle>
                        <CardDescription>A list of all products on the platform.</CardDescription>
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
                            placeholder="Search by product name..."
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
                        {paginatedProducts.map((p) => (
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
                                    <Link href={`/product/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link>
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
                                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the product.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteProduct(p.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
