
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import type { Dish, Order, Notification, User } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { MoreHorizontal, DollarSign, ShoppingCart, BarChart, PlusCircle, CheckCircle, Package, XCircle, Clock, Star, Zap, Trash2, Edit, MessageSquare, Eye, User as UserIcon, Phone, Mail, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, serverTimestamp, deleteDoc, runTransaction, increment } from 'firebase/firestore';
import { getUserById } from '@/lib/services/user-service';
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
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


type EnrichedOrder = Order & { buyer?: User | null };

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [sellerDishes, setSellerDishes] = useState<Dish[]>([]);
  const [sellerOrders, setSellerOrders] = useState<EnrichedOrder[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== 'seller') {
      router.push('/login');
      return;
    }

    if(user.isSuspended) {
        // Handled by the component's return statement, but good practice
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
     const unsubscribeOrders = onSnapshot(ordersQuery, async (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
       // Filter items to only show those belonging to the current seller for display
      const relevantOrders = ordersData.map(order => ({
        ...order,
        items: order.items.filter(item => item.sellerId === user.id)
      })).filter(order => order.items.length > 0);
      
      // Enrich orders with buyer information
      const enrichedOrders = await Promise.all(
        relevantOrders.map(async (order) => {
            const buyer = await getUserById(order.buyerId);
            return { ...order, buyer };
        })
      );
      setSellerOrders(enrichedOrders);
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
    // Handle both Firestore Timestamps and serialized date strings
    const orderDate = typeof order.createdAt === 'string' 
        ? new Date(order.createdAt) 
        : (order.createdAt as any).toDate();

    if (isNaN(orderDate.getTime())) return acc; // Invalid date

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
    if (!user) return;
    const orderRef = doc(db, 'orders', orderId);
    const sellerRef = doc(db, 'users', user.id);

    try {
        await runTransaction(db, async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists() || orderDoc.data().status === status) {
                // If order doesn't exist or status is already the same, do nothing.
                return;
            }
            
            transaction.update(orderRef, { status });

            const buyerNotificationRef = doc(collection(db, 'notifications'));
            transaction.set(buyerNotificationRef, {
                userId: buyerId,
                orderId: orderId,
                message: `Your order #${orderId.substring(0, 6)} is now ${status}.`,
                type: 'order-status',
                createdAt: serverTimestamp(),
                isRead: false,
            });

            // If the order is being marked as delivered, increment the seller's count
            if (status === 'Delivered' && orderDoc.data().status !== 'Delivered') {
                const sellerDoc = await transaction.get(sellerRef);
                const currentDeliveredCount = sellerDoc.data()?.deliveredOrderCount || 0;

                transaction.update(sellerRef, { deliveredOrderCount: increment(1) });

                if (currentDeliveredCount + 1 >= 100) {
                    transaction.update(sellerRef, { isSuspended: true });
                    const sellerNotificationRef = doc(collection(db, 'notifications'));
                    transaction.set(sellerNotificationRef, {
                        userId: user.id,
                        message: "Your account has been suspended after reaching 100 delivered orders. Please contact admin to re-activate.",
                        type: 'account-activated',
                        createdAt: serverTimestamp(),
                        isRead: false,
                    });
                }
            }
        });
        
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

  if (user.isSuspended) {
      return (
        <div className="container mx-auto py-12">
            <Card className="max-w-2xl mx-auto text-center border-destructive">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-destructive">Account Suspended</CardTitle>
                    <CardDescription>Your account has been temporarily suspended.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">You have successfully completed 100 orders. To continue selling on our platform, a monthly fee of 500 taka is required. Please contact admin to make the payment and re-activate your account.</p>
                     <Button asChild variant="outline">
                        <Link href="/contact">Contact Admin</Link>
                     </Button>
                </CardContent>
            </Card>
        </div>
      )
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
                <Card className="mb-8 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/30">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                          <Star className="h-6 w-6"/> You are a Pro Seller!
                      </CardTitle>
                        <CardDescription className="text-green-700 dark:text-green-400">
                          You have access to all features, including unlimited dish uploads and detailed analytics.
                        </CardDescription>
                  </CardHeader>
                </Card>

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
                        <CardDescription>Manage your dishes here. You have added {sellerDishes.length} dish(s).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[80px] sm:table-cell">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="hidden md:table-cell">Views</TableHead>
                                    <TableHead className="hidden md:table-cell">Price</TableHead>
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
                                                src={dish.images[0]}
                                                width="64"
                                                data-ai-hint={dish.category}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {dish.name}
                                            <div className="md:hidden text-muted-foreground">৳{dish.price.toFixed(2)}</div>
                                            <div className="md:hidden text-muted-foreground text-xs">Views: {dish.viewCount || 0}</div>
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
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                {dish.viewCount || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">৳{dish.price.toFixed(2)}</TableCell>
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
                                    <TableHead>Buyer</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sellerOrders.map(order => {
                                    const isActionable = order.status !== 'Delivered' && order.status !== 'Cancelled';

                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id?.substring(0,6)}</TableCell>
                                            <TableCell>{order.buyer?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                            {order.items.map(item => (
                                                <div key={item.id}>{item.name} x {item.quantity}</div>
                                            ))}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status)} className="capitalize flex items-center gap-1 w-fit">
                                                    <OrderStatusIcon status={order.status} />
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                  <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                          <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                          </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent>
                                                          <DialogTrigger asChild>
                                                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                                                          </DialogTrigger>
                                                          {isActionable && (
                                                            <>
                                                              <DropdownMenuSeparator />
                                                              <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Preparing', order.buyerId)}>Mark as Preparing</DropdownMenuItem>
                                                              <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Delivered', order.buyerId)}>Mark as Delivered</DropdownMenuItem>
                                                              <DropdownMenuItem onClick={() => handleStatusChange(order.id!, 'Cancelled', order.buyerId)} className="text-destructive">Cancel Order</DropdownMenuItem>
                                                            </>
                                                          )}
                                                          {order.buyer?.email && (
                                                              <>
                                                                  <DropdownMenuSeparator />
                                                                  <DropdownMenuItem asChild>
                                                                      <a href={`mailto:${order.buyer.email}`} className="flex items-center gap-2">
                                                                          <MessageSquare className="h-4 w-4"/>
                                                                          Message Buyer
                                                                      </a>
                                                                  </DropdownMenuItem>
                                                              </>
                                                          )}
                                                      </DropdownMenuContent>
                                                  </DropdownMenu>
                                                  <DialogContent>
                                                      <DialogHeader>
                                                          <DialogTitle>Order Details #{order.id?.substring(0, 6)}</DialogTitle>
                                                          <DialogDescription>Full contact and shipping information for this order.</DialogDescription>
                                                      </DialogHeader>
                                                      <div className="space-y-4 py-4">
                                                          <h4 className="font-semibold text-lg">Buyer Information</h4>
                                                          <div className="flex items-center gap-4">
                                                            <Avatar>
                                                              <AvatarImage src={order.buyer?.avatar} />
                                                              <AvatarFallback>{order.buyer?.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                              <p className="font-medium">{order.buyer?.name}</p>
                                                              <p className="text-sm text-muted-foreground">{order.buyer?.email}</p>
                                                            </div>
                                                          </div>
                                                          <div className="space-y-2 rounded-md border p-4 bg-muted/50">
                                                              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <span>{order.contact}</span></div>
                                                              <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-1" /> <span>{order.address}</span></div>
                                                          </div>
                                                      </div>
                                                  </DialogContent>
                                                </Dialog>
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
