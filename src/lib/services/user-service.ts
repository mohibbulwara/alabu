
'use server';

import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import type { User } from '@/types';

export async function getUserById(id: string): Promise<User | null> {
  if (!id) return null;
  
  const userRef = doc(db, 'users', id);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User;
  } else {
    console.warn(`User with id ${id} not found.`);
    return null;
  }
}

export async function getAllBuyers(): Promise<User[]> {
    const q = query(collection(db, 'users'), where('role', '==', 'buyer'));
    const querySnapshot = await getDocs(q);
    const buyers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return buyers;
}

export async function getAllSellers(): Promise<User[]> {
    const q = query(collection(db, 'users'), where('role', '==', 'seller'));
    const querySnapshot = await getDocs(q);
    const sellers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return sellers;
}
