
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProductCard from '@/components/product-card';
import { MapPin } from 'lucide-react';
import { getProducts } from '@/lib/services/product-service';
import { getUserById } from '@/lib/services/user-service';
import type { Product, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import MapCard from '@/components/map-card';
import SellerStatusBadge from '@/components/seller-status-badge';

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;
  const [seller, setSeller] = useState<User | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const fetchedSeller = await getUserById(sellerId);
        if (fetchedSeller && fetchedSeller.role === 'seller') {
          setSeller(fetchedSeller);
          const products = await getProducts({ sellerId: fetchedSeller.id });
          setSellerProducts(products);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch seller data:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);
  
  if (loading) {
      return (
          <div className="container mx-auto py-12">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-8 mb-12">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="text-center md:text-left space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-48" />
                </div>
            </div>
            <Skeleton className="h-8 w-1/3 mb-8" />
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ))}
             </div>
          </div>
      )
  }

  if (!seller) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center md:flex-row md:items-start gap-8 mb-12">
        <Avatar className="h-32 w-32 border-4 border-primary">
          <AvatarImage src={seller.avatar} alt={seller.name} data-ai-hint="person avatar" />
          <AvatarFallback className="text-4xl">{seller.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="font-headline text-4xl font-bold text-primary">{seller.shopName}</h1>
          <p className="text-lg text-muted-foreground">by {seller.name}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-muted-foreground">
            {seller.shopAddress && (
              <>
                <MapPin className="h-4 w-4" />
                <span>{seller.shopAddress}</span>
              </>
            )}
          </div>
           {seller.status && <SellerStatusBadge status={seller.status} className="mt-4" />}
        </div>
      </div>
      
      {seller.shopAddress && (
        <div className="mb-12">
            <h2 className="font-headline text-3xl font-bold mb-8 text-center md:text-left">
                Our Location
            </h2>
            <MapCard address={seller.shopAddress} />
        </div>
      )}

      <h2 className="font-headline text-3xl font-bold mb-8 text-center md:text-left">
        All Products from {seller.shopName}
      </h2>

      {sellerProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">{seller.name} has not added any products yet.</p>
        </div>
      )}
    </div>
  );
}
