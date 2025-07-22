
'use client';

import { getProducts } from '@/lib/services/product-service';
import ProductCard from './product-card';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { Skeleton } from './ui/skeleton';
import { motion } from 'framer-motion';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        // Sort products by rating in descending order. Ensure rating is a number.
        const sortedProducts = allProducts
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
        setFeaturedProducts(sortedProducts);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const ProductSkeleton = () => (
    <div className="flex flex-col space-y-3">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    </div>
  );

  return (
    <motion.section 
      className="bg-background py-16 md:py-24"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <div className="inline-block relative">
              <h2 className="font-headline text-3xl font-extrabold md:text-5xl text-shadow-lg bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text pb-2">
                <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-primary inline-block mr-4 mb-2" />
                  Featured Products
                <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-primary inline-block ml-4 mb-2" />
              </h2>
            </div>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Discover our most loved and highest-rated dishes.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
}
