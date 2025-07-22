
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { useCart } from '@/lib/hooks';
import { useLanguage } from '@/lib/hooks';
import RatingStars from './rating-stars';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Clock, BadgeAlert, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: `${product.name} added to cart!`,
    });
  };

  const isAvailable = product.isAvailable ?? true;
  const isDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;
  const mainImage = product.images?.[0] || 'https://placehold.co/600x400.png';

  return (
    <Card className="group relative overflow-hidden rounded-lg border-border/20 transition-all duration-300 h-full flex flex-col hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/product/${product.id}`} className="block">
        <div className="overflow-hidden aspect-[4/3] relative">
          <Image
            src={mainImage}
            alt={product.name}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${product.category}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
           {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg bg-black/70 px-4 py-2 rounded-md">Out of Stock</span>
            </div>
          )}
          {isDiscount && (
            <Badge variant="destructive" className="absolute top-2 right-2 text-base font-bold shadow-lg">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-4 space-y-3 flex flex-col flex-grow">
        <div className="flex-grow">
           {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {product.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          <h3 className="font-headline text-lg font-bold leading-tight text-foreground">
            <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors stretched-link">{product.name}</Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground h-10 overflow-hidden text-ellipsis">
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <RatingStars rating={product.rating} />
            <span className="ml-2 text-xs text-muted-foreground">({product.rating.toFixed(1)})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
             <Clock className="h-3 w-3" />
             <span>{product.deliveryTime}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-primary whitespace-nowrap">৳{product.price.toFixed(2)}</div>
              {isDiscount && (
                <div className="text-sm text-muted-foreground line-through">৳{product.originalPrice!.toFixed(2)}</div>
              )}
          </div>
           <Button 
              onClick={handleAddToCart} 
              size="sm"
              disabled={!isAvailable}
            >
              {isAvailable ? <>
                  <ShoppingCart className="h-4 w-4" />
                  <span className="ml-2 text-sm font-semibold">{t('addToCart')}</span>
              </> : <>
                  <BadgeAlert className="h-4 w-4" />
                  <span className="ml-2 text-sm font-semibold">Unavailable</span>
              </>}
          </Button>
        </div>
      </div>
    </Card>
  );
}
