
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CartItem as CartItemType } from '@/types';
import { useCart } from '@/lib/hooks';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const mainImage = item.images?.[0] || 'https://placehold.co/80x80.png';

  return (
    <div className="flex items-center p-4">
      <Image
        src={mainImage}
        alt={item.name}
        width={80}
        height={80}
        className="rounded-md object-cover"
      />
      <div className="ml-4 flex-grow">
        <Link href={`/dish/${item.id}`} className="font-semibold hover:text-primary">
          {item.name}
        </Link>
        <p className="text-sm text-muted-foreground">৳{item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          className="h-9 w-16 text-center"
        />
        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
