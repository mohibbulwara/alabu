import { Suspense } from 'react';
import { getProducts } from '@/lib/services/product-service';
import { getAllSellers } from '@/lib/services/user-service';
import ProductList from '@/components/product-list';
import { Skeleton } from '@/components/ui/skeleton';

const ProductsPageSkeleton = () => (
    <div className="container mx-auto py-8">
        <div className="text-center mb-8">
            <Skeleton className="h-10 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto mt-4" />
        </div>
        <div className="mb-8">
            <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
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
);

async function Products() {
  const [products, sellers] = await Promise.all([
    getProducts(),
    getAllSellers()
  ]);

  return <ProductList products={products} allSellers={sellers} />;
}

export default async function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
        <Products />
    </Suspense>
  );
}
