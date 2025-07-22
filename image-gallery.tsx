'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [mainImage, setMainImage] = useState(images?.[0] || 'https://placehold.co/800x600.png');

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square md:aspect-[4/3] relative overflow-hidden rounded-lg shadow-lg border">
        <Image
          src={mainImage}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {images && images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <button key={index} onClick={() => setMainImage(img)} className={cn('aspect-square relative overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-primary ring-offset-2 transition-all', mainImage === img ? 'ring-2 ring-primary' : 'ring-0 hover:opacity-80')}>
              <Image src={img} alt={`${alt} thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}