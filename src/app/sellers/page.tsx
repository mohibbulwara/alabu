
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { getAllSellers } from '@/lib/services/user-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ShoppingBag, Star } from 'lucide-react';

export default function SellersPage() {
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const fetchedSellers = await getAllSellers();
        // Sort sellers: 'pro' plan first, then by product count descending
        fetchedSellers.sort((a, b) => {
          if (a.planType === 'pro' && b.planType !== 'pro') return -1;
          if (a.planType !== 'pro' && b.planType === 'pro') return 1;
          return (b.productUploadCount || 0) - (a.productUploadCount || 0);
        });
        setSellers(fetchedSellers);
      } catch (error) {
        console.error("Failed to fetch sellers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  const SellerSkeleton = () => (
    <div className="flex flex-col space-y-3">
        <Skeleton className="h-[150px] w-full rounded-xl" />
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </div>
  );

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold text-primary">Our Sellers</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Meet the talented chefs and kitchens bringing you the best local flavors.</p>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <SellerSkeleton key={i} />)}
         </div>
      ) : sellers.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((seller, index) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/seller/${seller.id}`} className="block group">
                <Card className="h-full transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="flex-row items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/50">
                      <AvatarImage src={seller.avatar} alt={seller.shopName} data-ai-hint="person avatar"/>
                      <AvatarFallback>{seller.shopName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{seller.shopName}</CardTitle>
                      <p className="text-sm text-muted-foreground">by {seller.name}</p>
                    </div>
                    {seller.planType === 'pro' && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary border border-primary/20">
                            <Star className="h-3 w-3" />
                            <span>PRO</span>
                        </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {seller.shopAddress && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{seller.shopAddress}</span>
                        </div>
                    )}
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShoppingBag className="h-4 w-4" />
                        <span>{seller.productUploadCount || 0} products</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No sellers found.</p>
        </div>
      )}
    </div>
  );
}
