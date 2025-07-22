
'use server';

import { collection, getDocs, doc, getDoc, query, where, Timestamp, limit, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Product } from '@/types';

// Helper function to safely serialize Firestore Timestamps
const serializeProduct = (doc: any): Product => {
    const data = doc.data();
    const product: Product = { id: doc.id, ...data };
    
    if (data.createdAt && data.createdAt instanceof Timestamp) {
        product.createdAt = data.createdAt.toDate().toISOString();
    }
    
    return product;
}

interface GetProductsOptions {
    category?: string;
    sellerId?: string;
    limit?: number;
    sortBy?: 'rating-desc' | 'price-asc' | 'price-desc';
}

export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
    const productsCollection = collection(db, 'products');
    let q = query(productsCollection);

    // Apply Firestore-compatible filters first
    if (options.category && options.category !== 'All') {
        q = query(q, where('category', '==', options.category));
    }
    
    if (options.sellerId) {
        q = query(q, where('sellerId', '==', options.sellerId));
    }
    
    // To avoid needing a composite index for every category/sort combination,
    // we'll fetch based on the primary filter and then sort/limit in code.
    // This is a common pattern for Firestore.
    if (options.limit && !options.sortBy) {
       q = query(q, limit(options.limit));
    }


    const productSnapshot = await getDocs(q);

    let productList = productSnapshot.docs.map(serializeProduct);
    
    // Apply sorting in code
    if (options.sortBy) {
        const [field, direction] = options.sortBy.split('-');
        productList.sort((a, b) => {
            let valA = a[field as keyof Product];
            let valB = b[field as keyof Product];

            // Default to 0 for undefined ratings or prices
            valA = valA === undefined ? 0 : valA;
            valB = valB === undefined ? 0 : valB;

            if (direction === 'desc') {
                return (valB as number) - (valA as number);
            }
            return (valA as number) - (valB as number);
        });
    }

    // Apply limit after sorting if specified
    if (options.limit) {
        productList = productList.slice(0, options.limit);
    }
    
    // Final availability filter
    return productList.filter(product => product.isAvailable !== false);
}

export async function getProductById(id: string): Promise<Product | null> {
  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);

  if (productSnap.exists()) {
    return serializeProduct(productSnap);
  } else {
    return null;
  }
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  const q = query(collection(db, 'products'), where('sellerId', '==', sellerId));
  const querySnapshot = await getDocs(q);
  const products = querySnapshot.docs.map(serializeProduct);
  return products;
}
