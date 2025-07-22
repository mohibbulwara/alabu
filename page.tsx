import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase-config'; // Make sure this path is correct
import { incrementProductViewCount } from '@/lib/actions';
import type { Dish } from '@/types';
import { notFound } from 'next/navigation';
import RatingStars from '@/components/rating-stars';
import { Clock, ChefHat } from 'lucide-react';
import AddToCartButton from './add-to-cart-button';
import ShareButton from '@/components/share-button';
import { Badge } from '@/components/ui/badge';
import { getUserById } from '@/lib/services/user-service';
import { getDishes } from '@/lib/services/dish-service';
import ImageGallery from './image-gallery';
import { Separator } from '@/components/ui/separator';
import DishCard from '@/components/dish-card';
import Link from 'next/link';

async function getDish(dishId: string): Promise<Dish | null> {
  try {
    // Assumes your Firestore collection is named 'dishes'. Change if it's 'products' or something else.
    const dishRef = doc(db, 'dishes', dishId);
    const docSnap = await getDoc(dishRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Dish;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching dish:", error);
    return null;
  }
}

export default async function DishDetailsPage({ params }: { params: { dishId: string } }) {
  // Increment view count without blocking the page render.
  // This is a "fire-and-forget" action.
  incrementProductViewCount(params.dishId);

  const dish = await getDish(params.dishId);
  if (!dish) {
    notFound();
  }

  // Fetch seller and related dishes, but don't let it crash the page if it fails.
  let seller = null;
  let relatedDishes: Dish[] = [];

  try {
    const [fetchedSeller, allRelatedDishes] = await Promise.all([
      dish.sellerId ? getUserById(dish.sellerId) : Promise.resolve(null),
      // Only fetch related dishes if a category exists to prevent server errors.
      dish.category ? getDishes({ category: dish.category, limit: 5 }) : Promise.resolve([])
    ]);

    seller = fetchedSeller;
    relatedDishes = (allRelatedDishes || [])
      .filter(d => d.id !== dish.id)
      .slice(0, 4);
  } catch (error) {
    console.error("Error fetching related data for dish page:", error);
    // The page will still render, just without seller info or related dishes.
  }

  const isDiscount = dish.originalPrice && dish.originalPrice > dish.price;

  return (
    <div className="container mx-auto py-8 lg:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <ImageGallery images={dish.images || []} alt={dish.name} />
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <Badge variant="outline">{dish.category}</Badge>
            <h1 className="font-headline text-4xl lg:text-5xl font-bold text-primary">{dish.name}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <RatingStars rating={dish.rating} />
            <span className="text-muted-foreground">({dish.rating.toFixed(1)} rating)</span>
          </div>

          <p className="text-lg text-muted-foreground">{dish.description}</p>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-5 w-5 text-primary" /><span>{dish.deliveryTime}</span></div>
            {seller && (
              <Link href={`/seller/${seller.id}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ChefHat className="h-5 w-5 text-primary" />
                <span>From {seller.shopName || seller.name}</span>
              </Link>
            )}
          </div>

          <div className="pt-4">
            <div className="flex items-baseline gap-2"><div className="text-4xl font-bold text-foreground">৳{dish.price.toFixed(2)}</div>{isDiscount && (<div className="text-xl text-muted-foreground line-through">৳{dish.originalPrice!.toFixed(2)}</div>)}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <AddToCartButton dish={dish} />
            <ShareButton title={dish.name} text={`Check out this dish: ${dish.name}`} />
          </div>
        </div>
      </div>

      {relatedDishes.length > 0 && (
        <div className="mt-16 lg:mt-24">
          <Separator />
          <div className="py-12">
            <h2 className="font-headline text-3xl font-bold mb-8 text-center">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedDishes.map(relatedDish => (
                <DishCard key={relatedDish.id} dish={relatedDish} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}