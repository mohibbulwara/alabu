

import DishList from '@/components/dish-list';
import { getDishes } from '@/lib/services/dish-service';
import { getAllSellers } from '@/lib/services/user-service';
import { Suspense } from 'react';

export default async function ProductsPage() {
  const [dishes, sellers] = await Promise.all([
    getDishes(),
    getAllSellers()
  ]);

  return (
    <div className="container mx-auto py-8">
        <Suspense>
           <DishList allDishes={dishes} allSellers={sellers} />
        </Suspense>
    </div>
  );
}
