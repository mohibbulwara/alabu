
import ProductList from '@/components/product-list';
import { getProducts } from '@/lib/services/product-service';
import { getAllSellers } from '@/lib/services/user-service';

export default async function ProductsPage() {
  // Fetch both products and sellers in parallel
  const [products, sellers] = await Promise.all([
    getProducts(),
    getAllSellers()
  ]);

  return <ProductList products={products} allSellers={sellers} />;
}
