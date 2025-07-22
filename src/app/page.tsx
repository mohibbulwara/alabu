
import { Suspense } from 'react';
import CategoryShowcase from '@/components/category-showcase';
import FeaturedSellers from '@/components/featured-sellers';
import HeroSection from '@/components/hero-section';
import SubscriptionSection from '@/components/subscription-section';
import Testimonials from '@/components/testimonials';
import { getDishes } from '@/lib/services/dish-service';
import { getAllSellers } from '@/lib/services/user-service';
import { categories } from '@/lib/data';
import AllDishes from '@/components/all-dishes';

function AllDishesLoading() {
  // You can create a more sophisticated loading skeleton here
  return <div className="container py-12 text-center">Loading dishes...</div>;
}

export default async function HomePage() {
  const [allDishesData, allSellers] = await Promise.all([
    getDishes(),
    getAllSellers()
  ]);

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
      <Suspense fallback={<AllDishesLoading />}>
        <AllDishes allDishes={allDishesData} />
      </Suspense>
      <CategoryShowcase categories={categories} />
      <FeaturedSellers sellers={featuredSellers} />
      <Testimonials />
      <SubscriptionSection />
    </div>
  );
}
