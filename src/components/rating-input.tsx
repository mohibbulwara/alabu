
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  className?: string;
  disabled?: boolean;
}

export default function RatingInput({ value, onChange, maxRating = 5, className, disabled = false }: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className={cn('flex items-center gap-1', disabled && 'opacity-50', className)}>
      {[...Array(maxRating)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            onClick={() => !disabled && onChange(ratingValue)}
            onMouseEnter={() => !disabled && setHoverValue(ratingValue)}
            onMouseLeave={() => setHoverValue(0)}
            className={cn("transition-transform duration-150", !disabled && "cursor-pointer hover:scale-110")}
            disabled={disabled}
          >
            <Star
              className={cn(
                'h-6 w-6',
                ratingValue <= (hoverValue || value)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              )}
            />
            <span className="sr-only">Rate {ratingValue} out of {maxRating}</span>
          </button>
        );
      })}
    </div>
  );
}
