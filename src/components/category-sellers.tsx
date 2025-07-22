
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { User, Dish } from '@/types';
import { Card } from './ui/card';
import SellerCard from './seller-card';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

interface CategorySellersProps {
  category: string | null;
  allSellers: User[];
  allDishes: Dish[];
}

export default function CategorySellers({ category, allSellers, allDishes }: CategorySellersProps) {

  const categorySellers = useMemo(() => {
    if (!category || allSellers.length === 0 || allDishes.length === 0) {
      return [];
    }
    const sellerIdsInCategory = new Set(
      allDishes
        .filter(p => p.category === category)
        .map(p => p.sellerId)
    );
    return allSellers.filter(seller => sellerIdsInCategory.has(seller.id));
  }, [category, allSellers, allDishes]);

  return (
    <AnimatePresence>
      {category && categorySellers.length > 0 && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="bg-background py-12"
        >
          <div className="container mx-auto">
            <Card className="p-6 bg-secondary/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline text-2xl font-bold text-primary">
                  {category} Sellers
                </h2>
                <Link href={`/dishes?category=${encodeURIComponent(category)}`} className="text-sm font-medium text-primary hover:underline">
                  View All {category} Dishes &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySellers.map(seller => (
                  <SellerCard key={seller.id} seller={seller} />
                ))}
              </div>
            </Card>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
