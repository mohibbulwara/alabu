
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import type { Order, User, Dish, AdminLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, Package, BarChart, PieChart as PieChartIcon, AlertTriangle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, PieChart, Pie, Cell, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersTable from './users-table';
import DishesTable from './dishes-table';
import OrdersTable from './orders-table';
import LogsTable from './logs-table';

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  salesByMonth: { month: string; sales: number }[];
  topSellers: (User & { totalRevenue: number })[];
  categoryDistribution: { name: string; value: number }[];
}

interface AdminDashboardClientProps {
    initialStats: AdminStats;
    initialUsers: User[];
    initialOrders: Order[];
    initialDishes: Dish[];
    initialLogs: AdminLog[];
}

const chartConfig: ChartConfig = {
    sales: { label: 'Sales (BDT)', color: 'hsl(var(--primary))' },
};

const categoryChartConfig = {
    value: { label: 'Dishes' },
    Burger: { label: 'Burger', color: "hsl(var(--chart-1))" },
    Pizza: { label: 'Pizza', color: "hsl(var(--chart-2))" },
    Drinks: { label: 'Drinks', color: "hsl(var(--chart-3))" },
    Dessert: { label: 'Dessert', color: "hsl(var(--chart-4))" },
    Biryani: { label: 'Biryani', color: "hsl(var(--chart-5))" },
    Kebab: { label: 'Kebab', color: "hsl(var(--chart-1))" },
    'Set Menu': { label: 'Set Menu', color: "hsl(var(--chart-2))" },
    Pasta: { label: 'Pasta', color: "hsl(var(--chart-3))" },
    Soup: { label: 'Soup', color: "hsl(var(--chart-4))" },
    Salad: { label: 'Salad', color: "hsl(var(--chart-5))" },
    Curry: { label: 'Curry', color: "hsl(var(--chart-1))" },
    Rice: { label: 'Rice', color: "hsl(var(--chart-2))" },
    Noodles: { label: 'Noodles', color: "hsl(var(--chart-3))" },
    Seafood: { label: 'Seafood', color: "hsl(var(--chart-4))" },
    Vegetarian: { label: 'Vegetarian', color: "hsl(var(--chart-5))" },
    Sandwich: { label: 'Sandwich', color: "hsl(var(--chart-1))" },
    Breakfast: { label: 'Breakfast', color: "hsl(var(--chart-2))" },
    Appetizers: { label: 'Appetizers', color: "hsl(var(--chart-3))" },
    Coffee: { label: 'Coffee', color: "hsl(var(--chart-4))" },
    'Ice Cream': { label: 'Ice Cream', color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export default function AdminDashboardClient({ initialStats, initialUsers, initialOrders, initialDishes, initialLogs }: AdminDashboardClientProps) {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || !user || !['admin', 'moderator'].includes(user.role)) {
                router.push('/');
            }
        }
    }, [user, isAuthenticated, authLoading, router]);
    
    const [stats, setStats] = useState(initialStats);
    const [users, setUsers] = useState(initialUsers);
    const [orders, setOrders] = useState(initialOrders);
    const [dishes, setDishes] = useState(initialDishes);

    const pendingDishesCount = dishes.filter(p => p.approvalStatus === 'pending').length;

    const { totalRevenue, totalOrders, totalProducts, totalUsers, salesByMonth, categoryDistribution } = stats;

    if (authLoading || !user) {
        return <div className="container py-12 text-center">Loading or redirecting...</div>;
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Admin Dashboard</h1>
            
            <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users ({totalUsers})</TabsTrigger>
                    <TabsTrigger value="dishes">
                        Dishes ({totalProducts})
                        {pendingDishesCount > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                                {pendingDishesCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="orders">Orders ({totalOrders})</TabsTrigger>
                    <TabsTrigger value="logs">Audit Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent><div className="text-2xl font-bold">৳{totalRevenue.toFixed(2)}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent><div className="text-2xl font-bold">+{totalOrders}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Dishes</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent><div className="text-2xl font-bold">{totalProducts}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent><div className="text-2xl font-bold">{totalUsers}</div></CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Sales Overview</CardTitle>
                                <CardDescription>Platform sales performance over the last few months.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <RechartsBarChart data={salesByMonth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                        <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                                    </RechartsBarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Category Distribution</CardTitle>
                                <CardDescription>Dish distribution by category.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
                                    <PieChart>
                                        <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                            {categoryDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={categoryChartConfig[entry.name]?.color || '#8884d8'} />
                                            ))}
                                        </Pie>
                                        <Legend content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                
                <TabsContent value="users">
                    <UsersTable initialUsers={users} />
                </TabsContent>

                <TabsContent value="dishes">
                    <DishesTable initialDishes={dishes} />
                </TabsContent>

                <TabsContent value="orders">
                    <OrdersTable initialOrders={orders} />
                </TabsContent>
                 <TabsContent value="logs">
                    <LogsTable initialLogs={initialLogs} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
