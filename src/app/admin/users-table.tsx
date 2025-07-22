
'use client';

import { useState } from 'react';
import type { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { deleteUser, activateSeller, toggleWatchlist } from '@/lib/services/admin-actions';
import { MoreHorizontal, Trash2, Eye, MessageSquare, PlayCircle, ShieldAlert, Search, Star, FileDown } from 'lucide-react';
import { exportUsersToPDF } from '@/lib/pdf-generator';

export default function UsersTable({ initialUsers }: { initialUsers: User[] }) {
    const { user: adminUser } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const handleToggleWatchlist = async (userId: string) => {
        if (!adminUser) return;
        const result = await toggleWatchlist(adminUser.id, adminUser.name, userId);
        if (result.success) {
            toast({ title: 'Watchlist Updated', description: `User has been ${result.newState ? 'added to' : 'removed from'} the watchlist.` });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, onWatchlist: result.newState } : u));
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };
    
    const handleDeleteUser = async (userIdToDelete: string) => {
        if (!adminUser) return;
        const result = await deleteUser(adminUser.id, adminUser.name, userIdToDelete);
        if (result.success) {
            toast({ title: 'User Deleted', description: 'The user and their data have been removed.' });
            setUsers(prev => prev.filter(u => u.id !== userIdToDelete));
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };

    const handleActivateSeller = async (sellerId: string) => {
        if (!adminUser) return;
        const result = await activateSeller(adminUser.id, adminUser.name, sellerId);
        if (result.success) {
            toast({ title: 'Seller Activated', description: 'The seller account has been re-activated.' });
            setUsers(prev => prev.map(u => u.id === sellerId ? { ...u, isSuspended: false } : u));
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };

    const filteredUsers = users.filter(u => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const nameMatch = u.name.toLowerCase().includes(term);
        const emailMatch = u.email.toLowerCase().includes(term);
        const shopNameMatch = u.shopName?.toLowerCase().includes(term) || false;
        return nameMatch || emailMatch || shopNameMatch;
    });

    const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    const handleExport = () => {
        exportUsersToPDF(filteredUsers);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>A list of all users on the platform.</CardDescription>
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
                            placeholder="Search by name, email, shop..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1); // Reset to first page on search
                            }}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role / Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.map((u) => {
                            const defaultMessage = `Hello ${u.name},\n\nThis is a message from the Chefs' BD admin team regarding your account.\n\n\nBest regards,\nChefs' BD Team`;
                            const mailtoLink = `mailto:${u.email}?subject=Message from Chefs' BD Admin&body=${encodeURIComponent(defaultMessage)}`;
                            const isTargetAdmin = u.role === 'admin';
                            const canDelete = adminUser?.role === 'admin' && !isTargetAdmin;

                            return (
                                <TableRow key={u.id} className={u.onWatchlist ? 'bg-yellow-500/10' : ''}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {u.onWatchlist && <ShieldAlert className="h-4 w-4 text-yellow-500" title="On Watchlist"/>}
                                            <div>
                                                <div className="font-medium">{u.name}</div>
                                                <div className="text-sm text-muted-foreground">{u.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={u.role === 'seller' ? 'secondary' : u.role === 'admin' ? 'default' : u.role === 'moderator' ? 'outline' : 'outline'} className="capitalize w-fit">{u.role}</Badge>
                                            {u.role === 'seller' && u.isSuspended && (
                                                <Badge variant="destructive" className="w-fit">Suspended</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{u.createdAt ? format(new Date(u.createdAt as string), 'PP') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {u.role === 'seller' && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/seller-orders/${u.id}`} className="flex items-center gap-2"><Eye /> View Orders</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <a href={mailtoLink} className="flex items-center gap-2">
                                                                <MessageSquare className="h-4 w-4" /> Message Seller
                                                            </a>
                                                        </DropdownMenuItem>
                                                         <DropdownMenuItem onClick={() => handleToggleWatchlist(u.id)} className="flex items-center gap-2">
                                                            <ShieldAlert className="h-4 w-4" /> {u.onWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                    </>
                                                )}
                                                {u.role === 'seller' && u.isSuspended && adminUser?.role === 'admin' && (
                                                    <DropdownMenuItem onClick={() => handleActivateSeller(u.id)} className="flex items-center gap-2 text-green-600 focus:text-green-600">
                                                        <PlayCircle className="h-4 w-4" /> Activate Seller
                                                    </DropdownMenuItem>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild disabled={!canDelete}>
                                                        <Button variant="ghost" className="w-full justify-start p-2 h-auto font-normal text-destructive hover:text-destructive flex items-center gap-2" disabled={!canDelete}>
                                                            <Trash2 className="h-4 w-4" /> Delete User
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete the user and all their associated data (products, orders, etc).</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteUser(u.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
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
