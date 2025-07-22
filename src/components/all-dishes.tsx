
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Dish } from '@/types';
import DishCard from './dish-card';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, SlidersHorizontal } from 'lucide-react';
import DishFilters from './dish-filters';
import { useSearchParams } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface AllDishesProps {
  allDishes: Dish[];
}

const ITEMS_PER_PAGE = 9;

export default function AllDishes({ allDishes }: AllDishesProps) {
  const searchParams = useSearchParams();

  // Initialize state from URL params or defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [rating, setRating] = useState(Number(searchParams.get('rating')) || 0);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating-desc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredDishes = useMemo(() => {
    let dishes = [...allDishes];

    // Filter by search term
    if (searchTerm) {
      dishes = dishes.filter(dish => dish.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    // Filter by category
    if (category !== 'All') {
      dishes = dishes.filter(dish => dish.category === category);
    }
    // Filter by rating
    if (rating > 0) {
      dishes = dishes.filter(dish => dish.rating >= rating);
    }
    // Filter by availability
    dishes = dishes.filter(dish => dish.isAvailable !== false);
    
    // Sort results
    const [field, direction] = sortBy.split('-');
    dishes.sort((a, b) => {
      let valA = a[field as keyof Dish] ?? 0;
      let valB = b[field as keyof Dish] ?? 0;
      return direction === 'desc' ? (valB as number) - (valA as number) : (valA as number) - (valB as number);
    });

    return dishes;
  }, [allDishes, searchTerm, category, rating, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, rating, sortBy]);

  const totalPages = Math.ceil(filteredDishes.length / ITEMS_PER_PAGE);
  const paginatedDishes = filteredDishes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block relative">
            <h2 className="font-headline text-3xl font-extrabold md:text-5xl text-shadow-lg bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text pb-2">
              <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-primary inline-block mr-4 mb-2" />
              Explore Our Dishes
              <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-primary inline-block ml-4 mb-2" />
            </h2>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Find your next favorite meal from our curated collection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Desktop Filters */}
            <aside className="hidden md:block md:col-span-1">
                <div className="sticky top-24">
                    <DishFilters
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        category={category} setCategory={setCategory}
                        rating={rating} setRating={setRating}
                        sortBy={sortBy} setSortBy={setSortBy}
                    />
                </div>
            </aside>

             {/* Mobile Filters Trigger */}
            <div className="md:hidden flex items-center justify-between col-span-1 -mb-4">
                <span className="text-sm text-muted-foreground">{filteredDishes.length} results</span>
                <Sheet>
                    <SheetTrigger asChild>
                    <Button variant="outline">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                            <SheetDescription>
                                Refine your search to find the perfect dish.
                            </SheetDescription>
                        </SheetHeader>
                    <div className="py-4">
                        <DishFilters 
                             searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                             category={category} setCategory={setCategory}
                             rating={rating} setRating={setRating}
                             sortBy={sortBy} setSortBy={setSortBy}
                        />
                    </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Dish Grid */}
            <main className="md:col-span-3">
                <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                    {paginatedDishes.length > 0 ? (
                    paginatedDishes.map((dish, index) => (
                        <motion.div
                        key={dish.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.05 }}
                        >
                        <DishCard dish={dish} />
                        </motion.div>
                    ))
                    ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center py-20"
                    >
                        <p className="text-lg text-muted-foreground">No dishes found. Try adjusting your filters.</p>
                    </motion.div>
                    )}
                </AnimatePresence>
                </motion.div>

                 {totalPages > 1 && (
                    <div className="flex items-center justify-center pt-12">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => p - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>

      </div>
    </section>
  );
}
