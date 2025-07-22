
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getDishById, getDishes } from '@/lib/services/dish-service';
import { getUserById } from '@/lib/services/user-service';
import { incrementDishViewCount } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import DishDetailClient from './dish-detail-client';

const DishDetailSkeleton = () => (
    <div className="container mx-auto max-w-7xl py-12">
        <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-square rounded-2xl" />
                <div className="grid grid-cols-4 gap-2">
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-14 w-1/3" />
            </div>
        </div>
    </div>
);

async function DishDetailData({ id }: { id: string }) {
    // Increment view count. We don't need to wait for it.
    incrementDishViewCount(id);

    const dish = await getDishById(id);
    
    if (!dish) {
        notFound();
    }
    
    const [seller, allRelatedDishes] = await Promise.all([
        getUserById(dish.sellerId),
        getDishes({ category: dish.category, limit: 5 }) // Fetch 5 to ensure we get 4 others
    ]);

    const relatedDishes = allRelatedDishes
        .filter(p => p.id !== dish.id)
        .slice(0, 4);
    
    return <DishDetailClient dish={dish} seller={seller} relatedDishes={relatedDishes} />;
}


export default function DishDetailPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<DishDetailSkeleton />}>
            <DishDetailData id={params.id} />
        </Suspense>
    );
}
