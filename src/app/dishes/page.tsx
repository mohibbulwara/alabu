
import { Suspense } from 'react';
import { getDishes } from '@/lib/services/dish-service';
import type { SearchParams } from '@/types';
import AllDishes from '@/components/all-dishes';

// This page can now be removed or simplified if the homepage handles everything.
// For now, let's make it also use the AllDishes component for consistency.
export default async function DishesPage({ searchParams }: { searchParams: SearchParams }) {
    const dishes = await getDishes(searchParams);

    return (
        <div className="container mx-auto py-8">
            <Suspense>
                <AllDishes allDishes={dishes} />
            </Suspense>
        </div>
    );
}
