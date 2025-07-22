
'use client';

import type { Dish } from '@/types';
import DishCard from './dish-card';
import { AnimatePresence, motion } from 'framer-motion';

interface DishListProps {
  allDishes: Dish[];
}

export default function DishList({ allDishes: dishes }: DishListProps) {
    return (
        <AnimatePresence>
            {dishes && dishes.length > 0 ? (
                <motion.div
                    layout
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                >
                {dishes.map((dish, index) => (
                    <motion.div
                        key={dish.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.1 } }}
                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <DishCard dish={dish} />
                    </motion.div>
                ))}
                </motion.div>
            ) : (
                <div className="py-20 text-center col-span-full">
                    <p className="text-lg text-muted-foreground">No dishes found. Try adjusting your filters.</p>
                </div>
            )}
        </AnimatePresence>
    );
}
