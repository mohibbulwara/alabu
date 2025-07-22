
import { Suspense } from 'react';
import { getAdminStats, getAllUsersForAdmin, getAllOrdersForAdmin, getAllDishesForAdmin, getAdminLogs } from '@/lib/services/admin-service';
import AdminDashboardClient from './admin-dashboard-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const AdminPageSkeleton = () => (
    <div className="container mx-auto py-8 space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-4/5" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-4/5" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-4/5" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader><CardContent><Skeleton className="h-8 w-4/5" /></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-72 w-full" /></CardContent></Card>
            <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-72 w-full" /></CardContent></Card>
        </div>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
    </div>
)

async function AdminDashboardData() {
    const [stats, users, orders, dishes, logs] = await Promise.all([
        getAdminStats(),
        getAllUsersForAdmin(),
        getAllOrdersForAdmin(),
        getAllDishesForAdmin(),
        getAdminLogs(),
    ]);

    return (
        <AdminDashboardClient
            initialStats={stats}
            initialUsers={users}
            initialOrders={orders}
            initialDishes={dishes}
            initialLogs={logs}
        />
    );
}

export default async function AdminPage() {
    return (
        <Suspense fallback={<AdminPageSkeleton />}>
            <AdminDashboardData />
        </Suspense>
    );
}
