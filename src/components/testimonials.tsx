
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { reviews as allReviews } from '@/lib/data';
import type { Review } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import RatingStars from './rating-stars';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import Autoplay from "embla-carousel-autoplay"

export default function Testimonials() {
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Filter for high-rated reviews and shuffle them
    const highRated = allReviews
        .filter(r => r.rating >= 4)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
    setFeaturedReviews(highRated);
  }, []);

  if (featuredReviews.length === 0) {
    return null;
  }

  return (
    <motion.section 
      className="bg-secondary/30 py-16 md:py-24"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-extrabold md:text-5xl text-shadow-lg text-foreground">
                What Our Customers Say
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Real stories from satisfied food lovers.
            </p>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {featuredReviews.map((review) => (
              <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="flex flex-col h-full justify-between p-6">
                    <CardContent className="p-0 space-y-4">
                        <Quote className="h-8 w-8 text-primary" />
                        <p className="text-muted-foreground italic">
                            "{review.comment}"
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <Avatar>
                                <AvatarImage src={review.userAvatar} alt={review.userName} data-ai-hint="person avatar" />
                                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{review.userName}</p>
                                <RatingStars rating={review.rating} />
                            </div>
                        </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </motion.section>
  );
}
