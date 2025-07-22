
'use server';

import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import type { User, SellerStatus, Dish } from '@/types';
import { differenceInDays } from 'date-fns';

const calculateSellerStatus = (seller: User, dishes: Dish[]): SellerStatus => {
    if (seller.planType === 'pro') return 'Top Seller';

    const createdAtDate = seller.createdAt ? new Date(seller.createdAt as string) : new Date();
    if (differenceInDays(new Date(), createdAtDate) <= 30) return 'Rising Star';

    if (dishes.length > 0) {
        const totalRating = dishes.reduce((acc, p) => acc + p.rating, 0);
        const avgRating = totalRating / dishes.length;
        if (avgRating >= 4.5) return 'Customer Favorite';
    }

    return null;
};

// Helper function to safely serialize Firestore Timestamps
const serializeUser = (doc: any): User => {
    const data = doc.data();
    const user: User = { id: doc.id, ...data };
    
    if (data.createdAt && data.createdAt instanceof Timestamp) {
        user.createdAt = data.createdAt.toDate().toISOString();
    }
    
    return user;
}


export async function getUserById(id: string): Promise<User | null> {
  if (!id) return null;
  
  const userRef = doc(db, 'users', id);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const user = serializeUser(userSnap);

    if (user.role === 'seller') {
        const dishesQuery = query(collection(db, 'dishes'), where('sellerId', '==', user.id));
        const dishesSnapshot = await getDocs(dishesQuery);
        const dishes = dishesSnapshot.docs.map(doc => doc.data() as Dish);
        user.status = calculateSellerStatus(user, dishes);
    }
    return user;
  } else {
    console.warn(`User with id ${id} not found.`);
    return null;
  }
}

export async function getAllBuyers(): Promise<User[]> {
    const q = query(collection(db, 'users'), where('role', '==', 'buyer'));
    const querySnapshot = await getDocs(q);
    const buyers = querySnapshot.docs.map(serializeUser);
    return buyers;
}

export async function getAllSellers(): Promise<User[]> {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'seller')
    );
    const querySnapshot = await getDocs(q);
    
    // Filter out suspended sellers in code, as Firestore doesn't support != queries efficiently.
    const sellers = querySnapshot.docs
        .map(serializeUser)
        .filter(user => user.isSuspended !== true);
    
    const sellersWithStatus = await Promise.all(sellers.map(async (seller) => {
        const dishesQuery = query(collection(db, 'dishes'), where('sellerId', '==', seller.id));
        const dishesSnapshot = await getDocs(dishesQuery);
        const dishes = dishesSnapshot.docs.map(doc => doc.data() as Dish);
        seller.status = calculateSellerStatus(seller, dishes);
        return seller;
    }));
    
    return sellersWithStatus;
}
