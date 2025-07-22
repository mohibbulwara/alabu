
'use client';

import Link from 'next/link';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Star, ShoppingBag } from 'lucide-react';

interface SellerCardProps {
  seller: User;
}

export default function SellerCard({ seller }: SellerCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Link href={`/seller/${seller.id}`} className="block group">
        <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-md">
          <CardHeader className="flex-row items-center gap-3 p-3">
            <Avatar className="h-12 w-12 border-2 border-primary/50">
              <AvatarImage src={seller.avatar} alt={seller.shopName} data-ai-hint="person avatar"/>
              <AvatarFallback>{seller.shopName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="font-headline text-md group-hover:text-primary transition-colors">{seller.shopName}</CardTitle>
              <p className="text-xs text-muted-foreground">by {seller.name}</p>
            </div>
            {seller.planType === 'pro' && (
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary border border-primary/20">
                    <Star className="h-3 w-3" />
                </div>
            )}
          </CardHeader>
        </Card>
      </Link>
    </motion.div>
  );
}
