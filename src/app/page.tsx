
'use client';

import CategoryShowcase from '@/components/category-showcase';
import FeaturedProducts from '@/components/featured-products';
import FeaturedSellers from '@/components/featured-sellers';
import HeroSection from '@/components/hero-section';
import TodaysSpecial from '@/components/todays-special';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <FeaturedSellers />
      <TodaysSpecial />
    </div>
  );
}
