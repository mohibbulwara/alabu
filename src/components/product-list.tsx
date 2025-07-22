
'use client';

import { useState, useMemo } from 'react';
import type { Dish, User } from '@/types';
import DishCard from './dish-card';
import { useLanguage } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import RatingInput from '@/components/rating-input';
import { X, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { Card } from './ui/card';
import SellerCard from './seller-card';
import { AnimatePresence, motion } from 'framer-motion';
import { categories } from '@/lib/data';

const categoryNames = ['All', ...categories.map(c => c.name)];

interface ProductListProps {
  products: Dish[];
  allSellers: User[];
}

export default function ProductList({ products, allSellers }: ProductListProps) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState(0);

  const filteredDishes = useMemo(() => {
    return products.filter((product: Dish) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesRating = product.rating >= minRating;
      const isAvailable = product.isAvailable ?? true;
      return matchesSearch && matchesCategory && matchesRating && isAvailable;
    });
  }, [products, searchTerm, selectedCategory, minRating]);

  const categorySellers = useMemo(() => {
    if (selectedCategory === 'All') {
      return [];
    }
    const sellerIdsInCategory = new Set(
      products
        .filter(p => p.category === selectedCategory)
        .map(p => p.sellerId)
    );
    return allSellers.filter(seller => sellerIdsInCategory.has(seller.id));
  }, [products, selectedCategory, allSellers]);
  
  const ProductSkeleton = () => (
    <div className="flex flex-col space-y-3">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8 animated-card">
        <h1 className="font-headline text-4xl font-bold text-primary">
          {selectedCategory === 'All' ? t('allProducts') : `${selectedCategory}`}
        </h1>
        <p className="text-muted-foreground mt-2">Find your next favorite meal from our curated collection.</p>
      </div>
      
      <div className="mb-8 grid grid-cols-1 gap-6 rounded-lg border bg-card p-6 md:grid-cols-3 animated-card" style={{animationDelay: '100ms'}}>
        <div className="relative">
          <Label htmlFor="search">{t('searchPlaceholder')}</Label>
          <Search className="absolute left-3 top-[calc(50%_+_6px)] -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2 pl-10"
          />
        </div>
        <div>
          <Label htmlFor="category-select">{t('filterByCategory')}</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-select" className="mt-2">
              <SelectValue placeholder={t('filterByCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categoryNames.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'All' ? t('all') : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t('filterByRating')}</Label>
          <div className="mt-2 flex items-center space-x-2">
            <RatingInput value={minRating} onChange={setMinRating} />
            {minRating > 0 && (
                <Button onClick={() => setMinRating(0)} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
                    <X className="h-4 w-4"/>
                    <span className="sr-only">Clear rating</span>
                </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
            {filteredDishes.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredDishes.map((product, index) => (
                    <motion.div 
                        key={product.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                    <DishCard dish={product} />
                    </motion.div>
                ))}
                </div>
            ) : (
                <div className="py-20 text-center animated-card">
                <p className="text-lg text-muted-foreground">No products found. Try adjusting your filters.</p>
                </div>
            )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
            <AnimatePresence>
            {categorySellers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="sticky top-24"
                >
                    <Card className="p-4">
                        <h2 className="font-headline text-xl font-bold mb-4 text-primary">
                            Sellers in {selectedCategory}
                        </h2>
                        <div className="space-y-4">
                            {categorySellers.map(seller => (
                                <SellerCard key={seller.id} seller={seller} />
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>
        </aside>

      </div>
    </div>
  );
}
