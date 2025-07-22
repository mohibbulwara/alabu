
'use server';

import { collection, getDocs, doc, getDoc, query, where, Timestamp } from 'firebase/firestore';
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

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(serializeProduct);
  return productList;
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
