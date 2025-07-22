
'use client';

import { Suspense, useState, useEffect } from 'react';
import CategoryShowcase from '@/components/category-showcase';
import FeaturedSellers from '@/components/featured-sellers';
import HeroSection from '@/components/hero-section';
import SubscriptionSection from '@/components/subscription-section';
import Testimonials from '@/components/testimonials';
import { getDishes } from '@/lib/services/dish-service';
import { getAllSellers } from '@/lib/services/user-service';
import { categories } from '@/lib/data';
import AllDishes from '@/components/all-dishes';
import { Skeleton } from '@/components/ui/skeleton';
import type { Dish, User } from '@/types';
import CategorySellers from '@/components/category-sellers';


const AllDishesSkeleton = () => (
    <div className="container mx-auto py-16 md:py-24">
        <div className="text-center mb-12">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="hidden md:block md:col-span-1 space-y-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


export default function HomePage() {
  const [allDishesData, setAllDishesData] = useState<Dish[]>([]);
  const [allSellers, setAllSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [dishes, sellers] = await Promise.all([
        getDishes(),
        getAllSellers()
      ]);
      setAllDishesData(dishes);
      setAllSellers(sellers);
      setLoading(false);
    }
    fetchData();
  }, []);
  
  const featuredSellers = allSellers
    .sort((a, b) => {
      if (a.planType === 'pro' && b.planType !== 'pro') return -1;
      if (a.planType !== 'pro' && b.planType === 'pro') return 1;
      return (b.productUploadCount || 0) - (a.productUploadCount || 0);
    })
    .slice(0, 3);
  
  return (
    <div className="flex flex-col">
      <HeroSection />
      <Suspense fallback={<AllDishesSkeleton />}>
        <AllDishes dishes={allDishesData} />
      </Suspense>
      <CategoryShowcase categories={categories} onSelectCategory={setSelectedCategory} />
      <CategorySellers 
         key={selectedCategory} // Force re-render on category change
         category={selectedCategory} 
         allSellers={allSellers} 
         allDishes={allDishesData} 
       />
      <FeaturedSellers sellers={featuredSellers} />
      <Testimonials />
      <SubscriptionSection />
    </div>
  );
}
