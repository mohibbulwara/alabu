
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import type { Order } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

export default function OrdersPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== 'buyer') {
      router.push('/login');
      return;
    }

    const ordersQuery = query(
      collection(db, 'orders'), 
      where('buyerId', '==', user.id)
      // NOTE: Removed orderBy('createdAt', 'desc') to avoid needing a composite index in Firestore.
      // Sorting is now handled client-side.
    );
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      // Sort orders by date here in the client
      orders.sort((a, b) => {
          const timeA = a.createdAt ? (a.createdAt as Timestamp).toMillis() : 0;
          const timeB = b.createdAt ? (b.createdAt as Timestamp).toMillis() : 0;
          return timeB - timeA;
      });
      setUserOrders(orders);
    });

    return () => unsubscribe();
  }, [user, isAuthenticated, loading, router]);
  
  if (loading || !user || user.role !== 'buyer') {
    return <div className="container py-12 text-center">Loading or redirecting...</div>;
  }

  const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Preparing':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">My Orders</h1>
        <p className="text-muted-foreground">View your order history below.</p>
      </div>

      <div className="space-y-6">
        {userOrders.length > 0 ? (
          userOrders.map(order => (
            <Card key={order.id} className={order.status === 'Cancelled' ? 'bg-muted/30' : ''}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Order #{order.id?.substring(0, 6)}</CardTitle>
                  <CardDescription>
                    Placed on {format((order.createdAt as any).toDate(), 'MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <Badge variant={getStatusVariant(order.status)} className="capitalize">
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x ৳{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">৳{(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end bg-muted/50 p-4">
                 <div className="text-right">
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">৳{order.total.toFixed(2)}</p>
                 </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">You haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
