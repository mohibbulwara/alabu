
'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Card } from './ui/card';
import { motion } from 'framer-motion';
import { categories } from '@/lib/data';

export default function CategoryShowcase() {
  
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
            <div className="inline-block relative">
              <h2 className="font-headline text-3xl font-extrabold md:text-5xl text-shadow-lg text-foreground pb-2">
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary inline-block mr-4 mb-2" />
                  Shop By Category
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary inline-block ml-4 mb-2" />
              </h2>
            </div>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Click on a category to explore delicious options from our best kitchens.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => (
             <motion.div
              key={category.name}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={`/products?category=${category.name}`} className="group block">
                <Card className="overflow-hidden text-center transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                    <div className="aspect-square relative overflow-hidden">
                        <Image
                            src={category.image}
                            alt={category.name}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                            data-ai-hint={category.hint}
                        />
                    </div>
                    <div className="p-4 bg-card">
                        <h3 className="font-headline text-xl font-bold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                    </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
