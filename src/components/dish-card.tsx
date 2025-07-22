
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Dish } from '@/types';
import { useCart } from '@/lib/hooks';
import { useLanguage } from '@/lib/hooks';
import RatingStars from './rating-stars';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Clock, BadgeAlert } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface DishCardProps {
  dish: Dish;
}

export default function DishCard({ dish }: DishCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(dish);
    toast({
      title: `${dish.name} added to cart!`,
    });
  };

  const isAvailable = dish.isAvailable ?? true;
  const isDiscount = dish.originalPrice && dish.originalPrice > dish.price;
  const discountPercentage = isDiscount ? Math.round(((dish.originalPrice! - dish.price) / dish.originalPrice!) * 100) : 0;
  const mainImage = dish.images?.[0] || 'https://placehold.co/600x400.png';

  return (
    <Card className="group relative overflow-hidden rounded-lg border-border/20 transition-all duration-300 h-full flex flex-col hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/dish/${dish.id}`} className="block">
        <div className="overflow-hidden aspect-[4/3] relative">
          <Image
            src={mainImage}
            alt={dish.name}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${dish.category}`}
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
           {dish.tags && dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {dish.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          <h3 className="font-headline text-lg font-bold leading-tight text-foreground">
            <Link href={`/dish/${dish.id}`} className="hover:text-primary transition-colors stretched-link">{dish.name}</Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 h-[40px]">
            {dish.description}
          </p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <RatingStars rating={dish.rating} />
            <span className="ml-2 text-xs text-muted-foreground">({dish.rating.toFixed(1)})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
             <Clock className="h-3 w-3" />
             <span>{dish.deliveryTime}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-primary whitespace-nowrap">৳{dish.price.toFixed(2)}</div>
              {isDiscount && (
                <div className="text-sm text-muted-foreground line-through">৳{dish.originalPrice!.toFixed(2)}</div>
              )}
          </div>
           <Button 
              onClick={handleAddToCart} 
              size="sm"
              disabled={!isAvailable}
            >
              {isAvailable ? <>
                  <ShoppingCart className="h-4 w-4" />
                  <span className="ml-2 text-xs">{t('addToCart')}</span>
              </> : <>
                  <BadgeAlert className="h-4 w-4" />
                  <span className="ml-2 text-xs">Unavailable</span>
              </>}
          </Button>
        </div>
      </div>
    </Card>
  );
}
