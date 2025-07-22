'use server';

import { collection, getDocs, doc, getDoc, query, where, Timestamp, limit, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Dish, SearchParams } from '@/types';

// Helper function to safely serialize Firestore Timestamps
const serializeDish = (doc: any): Dish => {
    const data = doc.data();
    const dish: Dish = { id: doc.id, ...data };
    
    if (data.createdAt && data.createdAt instanceof Timestamp) {
        dish.createdAt = data.createdAt.toDate().toISOString();
    }
    
    return dish;
}

export async function getDishes(options: SearchParams = {}): Promise<Dish[]> {
    const dishesCollection = collection(db, 'dishes');
    let q = query(dishesCollection, where('isAvailable', '==', true));

    // Apply Firestore-compatible filters first
    if (options.category && options.category !== 'All') {
        q = query(q, where('category', '==', options.category));
    }
    
    if (options.sellerId) {
        q = query(q, where('sellerId', '==', options.sellerId));
    }

    const dishSnapshot = await getDocs(q);

    let dishList = dishSnapshot.docs.map(serializeDish);

    // Apply client-side filters for things Firestore doesn't handle well without composite indexes
    if (options.rating) {
        dishList = dishList.filter(dish => dish.rating >= Number(options.rating));
    }

    if (options.search) {
        const searchTerm = String(options.search).toLowerCase();
        dishList = dishList.filter(dish => dish.name.toLowerCase().includes(searchTerm));
    }
    
    // Apply sorting
    if (options.sortBy) {
        const [field, direction] = String(options.sortBy).split('-');
        dishList.sort((a, b) => {
            let valA = a[field as keyof Dish];
            let valB = b[field as keyof Dish];

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
        dishList = dishList.slice(0, Number(options.limit));
    }
    
    return dishList;
}

export async function getDishById(id: string): Promise<Dish | null> {
  const dishRef = doc(db, 'dishes', id);
  const dishSnap = await getDoc(dishRef);

  if (dishSnap.exists()) {
    return serializeDish(dishSnap);
  } else {
    return null;
  }
}
