
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import type { Dish, Order, Notification } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { MoreHorizontal, DollarSign, ShoppingCart, BarChart, PlusCircle, CheckCircle, Package, XCircle, Clock, Star, Zap, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateDish } from '@/lib/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [sellerDishes, setSellerDishes] = useState<Dish[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== 'seller') {
      router.push('/login');
      return;
    }

    // Fetch Dishes
    const dishesQuery = query(collection(db, 'dishes'), where('sellerId', '==', user.id));
    const unsubscribeDishes = onSnapshot(dishesQuery, (snapshot) => {
      const dishesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dish[];
      setSellerDishes(dishesData);
    });

    // Fetch Orders related to this seller
    const ordersQuery = query(collection(db, 'orders'), where('sellerIds', 'array-contains', user.id));
     const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
       // Filter items to only show those belonging to the current seller for display
      const relevantOrders = ordersData.map(order => ({
        ...order,
        items: order.items.filter(item => item.sellerId === user.id)
      })).filter(order => order.items.length > 0);
      setSellerOrders(relevantOrders);
    });

    return () => {
      unsubscribeDishes();
      unsubscribeOrders();
    };
  }, [user, isAuthenticated, loading, router]);

  const deliveredOrders = sellerOrders.filter(order => order.status === 'Delivered');

  const totalRevenue = deliveredOrders.reduce((acc, order) => {
    const sellerItemsTotal = order.items.reduce((itemAcc, item) => {
        const itemTotal = item.price * item.quantity;
        const commission = item.commissionPercentage || 5;
        return itemAcc + (itemTotal - (itemTotal * (commission / 100)));
    }, 0);
    return acc + sellerItemsTotal;
  }, 0);

  const totalOrders = sellerOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const salesData = deliveredOrders.reduce((acc, order) => {
    if (!order.createdAt) return acc;
    const orderDate = new Date(order.createdAt as string); // Convert ISO string
    const month = format(orderDate, 'MMM yyyy');
    const sellerItemsTotal = order.items.reduce((itemAcc, item) => itemAcc + item.price * item.quantity, 0);

    const existingMonth = acc.find(d => d.month === month);
    if (existingMonth) {
      existingMonth.sales += sellerItemsTotal;
    } else {
      acc.push({ month, sales: sellerItemsTotal });
    }
    return acc;
  }, [] as { month: string; sales: number }[]).reverse();


  const chartConfig = {
    sales: {
      label: 'Sales (BDT)',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  const handleStatusChange = async (orderId: string, status: Order['status'], buyerId: string) => {
    const orderRef = doc(db, 'orders', orderId);
    try {
      await updateDoc(orderRef, { status });

      const batch = writeBatch(db);
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
          userId: buyerId,
          orderId: orderId,
          message: `Your order #${orderId.substring(0, 6)} is now ${status}.`,
          type: 'order-status',
          createdAt: serverTimestamp(),
          isRead: false,
      });
      await batch.commit();

      toast({ title: 'Order Updated', description: `Order status changed to ${status}.` });
    } catch (error) {
        console.error("Error updating status:", error);
        toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' });
    }
  };
  
  const handleDelete = async (dishId: string) => {
    try {
        await deleteDoc(doc(db, "dishes", dishId));
        toast({ title: "Dish Deleted", description: "The dish has been removed." });
    } catch (error) {
        console.error("Error deleting dish:", error);
        toast({ title: 'Error', description: 'Failed to delete dish.', variant: 'destructive' });
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { planType: 'pro' });
        toast({ title: 'Upgrade Successful!', description: "You are now a Pro Seller!" });
        // This will trigger a re-render as useAuth hook listens to user changes
    } catch (error) {
        console.error("Error upgrading account:", error);
        toast({ title: 'Error', description: 'Failed to upgrade account.', variant: 'destructive' });
    }
  };

  const handleAvailabilityChange = async (dishId: string, isAvailable: boolean) => {
    try {
      const result = await updateDish(dishId, { isAvailable });
      if (result.error) {
        throw new Error(result.error);
      }
      toast({ title: 'Stock Updated', description: `Dish is now ${isAvailable ? 'available' : 'unavailable'}.` });
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast({ title: 'Error', description: error.message || 'Failed to update stock status.', variant: 'destructive' });
    }
  };


  const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Preparing': return 'secondary';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };
  
  if (loading || !user || user.role !== 'seller') {
      return <div className="container py-12 text-center">Loading or redirecting...</div>;
  }

  const OrderStatusIcon = ({ status }: { status: Order['status'] }) => {
    switch (status) {
        case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'Preparing': return <Package className="h-4 w-4 text-blue-500" />;
        case 'Delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'Cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
                Seller Dashboard
            </h1>
            <Button asChild>
                <Link href="/dashboard/add-product">
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add New Dish
                </Link>
            </Button>
       </div>
       
        <Tabs defaultValue="overview">
            <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="dishes">Dishes</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
                {user.planType === 'free' && (
                    <Card className="mb-8 bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <Zap className="h-6 w-6"/> You are on the Free Plan!
                            </CardTitle>
                             <CardDescription className="text-blue-700">
                                Upgrade to Pro for unlimited dish uploads and more features.
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700">
                                <Star className="mr-2 h-4 w-4"/>
                                Upgrade to Pro
                             </Button>
                        </CardContent>
                    </Card>
                )}
                {user.planType === 'pro' && (
                     <Card className="mb-8 bg-green-50 border-green-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <Star className="h-6 w-6"/> You are a Pro Seller!
                            </CardTitle>
                             <CardDescription className="text-green-700">
                                You have access to all features, including unlimited dish uploads and detailed analytics.
                             </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{totalRevenue.toFixed(2)}</div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalOrders}</div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{averageOrderValue.toFixed(2)}</div>
                    </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Your sales performance over the last few months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <RechartsBarChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                                />
                            <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                        </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="dishes">
                <Card>
                    <CardHeader>
                        <CardTitle>My Dishes</CardTitle>
                        <CardDescription>Manage your dishes here. You have added {sellerDishes.length} dish(es).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[80px] sm:table-cell">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="hidden md:table-cell">Price</TableHead>
                                    <TableHead className="hidden md:table-cell">Commission</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sellerDishes.map(dish => {
                                    const isAvailable = dish.isAvailable ?? true;
                                    return (
                                    <TableRow key={dish.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image
                                                alt={dish.name}
                                                className="aspect-square rounded-md object-cover"
                                                height="64"
                                                src={dish.images?.[0] || `https://placehold.co/64x64.png?text=${dish.name.charAt(0)}`}
                                                width="64"
                                                data-ai-hint={dish.category}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {dish.name}
                                            <div className="md:hidden text-muted-foreground">৳{dish.price.toFixed(2)}</div>
                                            <div className="md:hidden text-muted-foreground text-xs">Commission: {dish.commissionPercentage}%</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`stock-${dish.id}`}
                                                    checked={isAvailable}
                                                    onCheckedChange={(checked) => handleAvailabilityChange(dish.id, checked)}
                                                />
                                                <Label htmlFor={`stock-${dish.id}`} className={isAvailable ? 'text-green-600' : 'text-red-600'}>
                                                   {isAvailable ? 'In Stock' : 'Out of Stock'}
                                                </Label>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">৳{dish.price.toFixed(2)}</TableCell>
                                        <TableCell className="hidden md:table-cell">{dish.commissionPercentage}%</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                      <Link href={`/dashboard/edit-product/${dish.id}`} className="flex items-center gap-2">
                                                        <Edit className="h-4 w-4" />
                                                        <span>Edit</span>
                                                      </Link>
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                      <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" className="w-full justify-start p-2 h-auto font-normal text-destructive hover:text-destructive flex items-center gap-2">
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Delete</span>
                                                        </Button>
                                                      </AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete the dish.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(dish.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
                        {sellerDishes.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">You have not added any dishes yet.</div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="orders">
                 <Card>
                    <CardHeader>
                        <CardTitle>Incoming Orders</CardTitle>
                        <CardDescription>Manage your incoming orders here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>You Receive</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sellerOrders.map(order => {
                                    const sellerItems = order.items.filter(item => item.sellerId === user.id);
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
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">Update Status</Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Preparing', order.buyerId)}>Preparing</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Delivered', order.buyerId)}>Delivered</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Cancelled', order.buyerId)} className="text-destructive">Cancel</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                         {sellerOrders.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">You have no orders yet.</div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
