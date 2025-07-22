
'use server';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

export async function createLog(
  adminId: string,
  adminName: string,
  action: string,
  targetType?: 'user' | 'dish' | 'order' | 'system',
  targetId?: string
) {
  try {
    await addDoc(collection(db, 'admin_logs'), {
      adminId,
      adminName,
      action,
      targetType: targetType || null,
      targetId: targetId || null,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to create admin log:', error);
    // Depending on requirements, you might want to handle this error more gracefully
  }
}
