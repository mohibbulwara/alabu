
'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Pizza,
  UtensilsCrossed,
  Flame,
  LayoutGrid,
  Utensils,
  Soup,
  Salad,
  CakeSlice,
  CupSoda,
  CookingPot,
  Wheat,
  Voicemail,
  Fish,
  Vegan,
  Sandwich,
  Coffee,
  IceCream,
  Popcorn
} from 'lucide-react';
import type { ComponentType } from 'react';

interface Category {
  name: string;
  // The hint property is no longer used but kept for data consistency.
  hint: string; 
}

interface CategoryShowcaseProps {
  categories: Category[];
}

const iconMap: { [key: string]: ComponentType<{ className?: string }> } = {
  Burger: Utensils,
  Pizza: Pizza,
  Biryani: UtensilsCrossed,
  Kebab: Flame,
  'Set Menu': LayoutGrid,
  Pasta: Utensils,
  Soup: Soup,
  Salad: Salad,
  Dessert: CakeSlice,
  Drinks: CupSoda,
  Curry: CookingPot,
  Rice: Wheat,
  Noodles: Voicemail,
  Seafood: Fish,
  Vegetarian: Vegan,
  Sandwich: Sandwich,
  Breakfast: Coffee,
  Appetizers: Popcorn,
  Coffee: Coffee,
  'Ice Cream': IceCream,
};

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section 
      className="bg-secondary/30 py-16 md:py-24"
    >
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-extrabold md:text-5xl text-shadow-lg text-foreground pb-2">
              Shop By Category
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Click on a category to explore delicious options from our best kitchens.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => {
             const Icon = iconMap[category.name] || Utensils;
             return (
             <motion.div
              key={category.name}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link href={`/dishes?category=${encodeURIComponent(category.name)}`} className="group block h-full">
                <Card className="h-full overflow-hidden text-center transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:-translate-y-1">
                    <div className="bg-muted/40 p-6 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/10">
                        <Icon className="h-12 w-12 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-110" />
                    </div>
                    <div className="p-4 bg-card">
                        <h3 className="font-headline text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">{category.name}</h3>
                    </div>
                </Card>
              </Link>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}
