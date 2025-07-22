
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/services/product-service';
import { getUserById } from '@/lib/services/user-service';
import { incrementProductViewCount } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import ProductDetailClient from './product-detail-client';

const ProductDetailSkeleton = () => (
    <div className="container mx-auto max-w-7xl py-12">
        <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-square rounded-2xl" />
                <div className="grid grid-cols-4 gap-2">
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="w-full aspect-square rounded-md" />
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-14 w-1/3" />
            </div>
        </div>
    </div>
);

async function ProductDetailData({ id }: { id: string }) {
    // Increment view count. We don't need to wait for it.
    incrementProductViewCount(id);

    const product = await getProductById(id);
    
    if (!product) {
        notFound();
    }
    
    const [seller, allRelatedProducts] = await Promise.all([
        getUserById(product.sellerId),
        getProducts({ category: product.category, limit: 5 }) // Fetch 5 to ensure we get 4 others
    ]);

    const relatedProducts = allRelatedProducts
        .filter(p => p.id !== product.id)
        .slice(0, 4);
    
    return <ProductDetailClient product={product} seller={seller} relatedProducts={relatedProducts} />;
}


export default function ProductDetailPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductDetailData id={params.id} />
        </Suspense>
    );
}
