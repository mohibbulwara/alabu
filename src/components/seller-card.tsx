
'use client';

import Link from 'next/link';
import type { User } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import SellerStatusBadge from './seller-status-badge';

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
            {seller.status && <SellerStatusBadge status={seller.status} />}
          </CardHeader>
        </Card>
      </Link>
    </motion.div>
  );
}
