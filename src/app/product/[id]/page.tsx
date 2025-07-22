
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { users, reviews as allReviews } from '@/lib/data';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useAuth, useCart, useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import RatingStars from '@/components/rating-stars';
import RatingInput from '@/components/rating-input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ShoppingCart, Loader2, Clock, Mail, Phone, ChevronDown, BadgeAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { formatDistanceToNow } from 'date-fns';
import ProductCard from '@/components/product-card';
import { getProductById, getProducts } from '@/lib/services/product-service';
import { getUserById } from '@/lib/services/user-service';
import type { Product, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import MapCard from '@/components/map-card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.'),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [reviews, setReviews] = useState(allReviews.filter(r => r.productId === params.id));
  const [isSubmitting, startTransition] = useTransition();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const fetchedProduct = await getProductById(params.id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          const [allProducts, fetchedSeller] = await Promise.all([
            getProducts(),
            getUserById(fetchedProduct.sellerId)
          ]);
          
          if (fetchedSeller) setSeller(fetchedSeller);

          const related = allProducts
            .filter(p => p.category === fetchedProduct.category && p.id !== fetchedProduct.id)
            .slice(0, 4);
          setRelatedProducts(related);

        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch product data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [params.id]);


  const averageRating = useMemo(() => {
    if (!product) return 0;
    if (reviews.length === 0) return product.rating;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }, [reviews, product]);


  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({ title: `${product.name} added to cart!` });
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleReviewSubmit = (data: ReviewFormValues) => {
    if (!user || !product) return;
    
    startTransition(async () => {
      await sleep(500);
      const newReview = {
        id: `review-${Date.now()}`,
        productId: product.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating: data.rating,
        comment: data.comment,
        createdAt: new Date(),
      };
      setReviews(prev => [newReview, ...prev]);
      allReviews.unshift(newReview);
      form.reset();
      toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
    });
  };
  
  if (loading) {
    return (
        <div className="container mx-auto max-w-6xl py-12">
            <div className="grid md:grid-cols-2 gap-12">
                <Skeleton className="w-full aspect-square rounded-2xl" />
                <div className="flex flex-col gap-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-14 w-1/3" />
                </div>
            </div>
        </div>
    )
  }
  
  if (!product) {
    notFound();
  }

  const isAvailable = product.isAvailable ?? true;

  return (
    <motion.div 
        className="container mx-auto max-w-7xl py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div 
            className="overflow-hidden rounded-2xl aspect-square"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
        >
            <Image
              src={product.image}
              alt={product.name}
              width={800}
              height={800}
              className="w-full h-full object-cover"
              data-ai-hint={`${product.category}`}
            />
        </motion.div>
        <motion.div 
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="font-headline text-4xl md:text-5xl font-bold">{product.name}</h1>
          <div className="mt-4 flex items-center gap-4">
             <RatingStars rating={averageRating} />
             <span className="text-sm text-muted-foreground">{averageRating.toFixed(1)} / 5 ({reviews.length} reviews)</span>
          </div>
          <p className="mt-6 text-lg text-muted-foreground">{product.description}</p>
          
          <div className="my-8 flex items-baseline gap-6">
            <div className="text-5xl font-bold text-primary">৳{product.price.toFixed(2)}</div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5"/>
                <span className="font-medium">{product.deliveryTime}</span>
            </div>
          </div>
          
          {seller && (
             <div className="mt-4 rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">Sold by:</p>
                <Link href={`/seller/${seller.id}`} className="flex items-center gap-3 mt-2 group">
                    <Avatar>
                        <AvatarImage src={seller.avatar} alt={seller.shopName || seller.name} data-ai-hint="person avatar"/>
                        <AvatarFallback>{(seller.shopName || seller.name).charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold group-hover:text-primary transition-colors">{seller.shopName || seller.name}</span>
                </Link>
             </div>
          )}

          <div className="mt-10 flex gap-4">
            <motion.div whileTap={{ scale: 0.95 }} className="w-full md:w-auto">
                <Button onClick={handleAddToCart} size="lg" className="w-full md:w-auto font-bold text-lg px-8 py-6" disabled={!isAvailable}>
                    {isAvailable ? <>
                        <ShoppingCart className="mr-2 h-5 w-5"/>
                        {t('addToCart')}
                    </> : <>
                        <BadgeAlert className="mr-2 h-5 w-5"/>
                        Out of Stock
                    </>}
                </Button>
            </motion.div>
            {seller && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="lg" className="px-8 py-6">Contact Seller <ChevronDown className="ml-2 h-4 w-4"/></Button>
                    </motion.div>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute z-10 mt-2 w-full max-w-xs rounded-lg bg-card border p-4 shadow-lg">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Seller Contact</h4>
                    <a href={`mailto:${seller.email}`} className="flex items-center gap-3 text-sm hover:text-primary"><Mail className="h-4 w-4" /><span>{seller.email}</span></a>
                    {seller.phone && (<a href={`tel:${seller.phone}`} className="flex items-center gap-3 text-sm hover:text-primary"><Phone className="h-4 w-4" /><span>{seller.phone}</span></a>)}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
          {!isAvailable && (
            <Badge variant="destructive" className="mt-4 w-fit">This item is temporarily unavailable.</Badge>
          )}
        </motion.div>
      </div>
      
      <Separator className="my-16" />

      {relatedProducts.length > 0 && (
        <div className="mb-16">
          <h2 className="font-headline text-3xl font-bold mb-8 text-center">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => ( <ProductCard key={p.id} product={p} /> ))}
          </div>
        </div>
      )}

      {seller?.shopAddress && (
        <div className="mb-16">
            <h2 className="font-headline text-3xl font-bold mb-8 text-center">Seller Location</h2>
            <MapCard address={seller.shopAddress} />
        </div>
      )}

       <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
            <Card>
                <CardHeader><CardTitle>Leave a Review</CardTitle></CardHeader>
                <CardContent>
                    {isAuthenticated ? (
                       <Form {...form}>
                         <form onSubmit={form.handleSubmit(handleReviewSubmit)} className="space-y-6">
                            <FormField control={form.control} name="rating" render={({ field }) => ( <FormItem><FormLabel>Your Rating</FormLabel><FormControl><RatingInput disabled={isSubmitting} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="comment" render={({ field }) => ( <FormItem><FormLabel>Your Comment</FormLabel><FormControl><Textarea disabled={isSubmitting} placeholder="Tell us what you think..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </Button>
                         </form>
                       </Form>
                    ) : ( <div className="text-center text-muted-foreground p-8"><p>You must be <Link href="/login" className="text-primary underline">logged in</Link> to leave a review.</p></div> )}
                </CardContent>
            </Card>
        </div>
        <div>
             <h2 className="text-2xl font-bold mb-4 font-headline">Customer Reviews</h2>
             <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="flex gap-4">
                            <Avatar><AvatarImage src={review.userAvatar} alt={review.userName} data-ai-hint="person avatar"/><AvatarFallback>{review.userName.charAt(0)}</AvatarFallback></Avatar>
                            <div className="flex-1">
                               <div className="flex justify-between items-center"><p className="font-semibold">{review.userName}</p><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt as Date), { addSuffix: true })}</span></div>
                                <RatingStars rating={review.rating} className="my-1" />
                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                            </div>
                        </div>
                    ))
                ) : ( <p className="text-muted-foreground">No reviews yet. Be the first!</p> )}
             </div>
        </div>
      </div>
    </motion.div>
  );
}
