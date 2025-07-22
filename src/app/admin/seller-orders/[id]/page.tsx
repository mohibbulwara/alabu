
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import type { Order, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { getUserById } from '@/lib/services/user-service';

const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Preparing': return 'secondary';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
};

const OrderStatusIcon = ({ status }: { status: Order['status'] }) => {
    switch (status) {
        case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'Preparing': return <Package className="h-4 w-4 text-blue-500" />;
        case 'Delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'Cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return null;
    }
};

const SellerOrdersSkeleton = () => (
     <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-8 w-48" />
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <Skeleton className="h-5 w-1/4" />
                            <Skeleton className="h-5 w-1/4" />
                            <Skeleton className="h-5 w-1/4" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
)

const serializeOrder = (doc: any): Order => {
    const data = doc.data();
    const order: Order = { id: doc.id, ...data };
    
    if (data.createdAt && data.createdAt instanceof Timestamp) {
        order.createdAt = data.createdAt.toDate();
    }
    
    return order;
}

export default function SellerOrdersPage() {
    const { user: adminUser, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const sellerId = params.id as string;
    
    const [seller, setSeller] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !['admin', 'moderator'].includes(adminUser?.role ?? ''))) {
            router.push('/');
        }
    }, [adminUser, isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (!sellerId || !adminUser) return;

        setLoading(true);
        const fetchSeller = async () => {
            const sellerData = await getUserById(sellerId);
            if (sellerData && sellerData.role === 'seller') {
                setSeller(sellerData);
            } else {
                notFound();
            }
        };

        fetchSeller();

        const ordersQuery = query(collection(db, 'orders'), where('sellerIds', 'array-contains', sellerId));
        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const ordersData = snapshot.docs.map(serializeOrder);
            const relevantOrders = ordersData.map(order => ({
                ...order,
                items: order.items.filter(item => item.sellerId === sellerId)
            })).filter(order => order.items.length > 0);
            
            // Sort client-side
            relevantOrders.sort((a, b) => ((b.createdAt as Date)?.getTime() || 0) - ((a.createdAt as Date)?.getTime() || 0));

            setOrders(relevantOrders);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [sellerId, adminUser]);

    if (authLoading || loading || !seller) {
        return <SellerOrdersSkeleton />;
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                 <Button variant="ghost" asChild>
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin Dashboard
                    </Link>
                </Button>
            </div>
            <div className="flex items-center gap-4">
                 <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={seller.avatar} alt={seller.shopName || seller.name} />
                    <AvatarFallback>{(seller.shopName || seller.name)?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-headline text-3xl font-bold text-primary">{seller.shopName}</h1>
                    <p className="text-muted-foreground">Viewing all orders for this seller.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seller Order History</CardTitle>
                    <CardDescription>A list of all orders fulfilled by {seller.shopName}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Seller Receives</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => {
                                const sellerItems = order.items;
                                const subtotal = sellerItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                                const platformFee = sellerItems.reduce((acc, item) => {
                                    const itemTotal = item.price * item.quantity;
                                    const commission = item.commissionPercentage || 5;
                                    return acc + (itemTotal * (commission / 100));
                                }, 0);
                                const sellerReceives = subtotal - platformFee;

                                return (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id?.substring(0,6)}</TableCell>
                                        <TableCell>{order.createdAt ? format(order.createdAt as Date, 'PP') : 'N/A'}</TableCell>
                                        <TableCell>
                                            {sellerItems.map(item => (
                                                <div key={item.id}>{item.name} x {item.quantity}</div>
                                            ))}
                                        </TableCell>
                                        <TableCell>৳{sellerReceives.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)} className="capitalize flex items-center gap-1 w-fit">
                                                <OrderStatusIcon status={order.status} />
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    {orders.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">This seller has no orders yet.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
