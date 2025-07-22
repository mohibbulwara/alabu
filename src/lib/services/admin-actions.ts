
'use server';

import { doc, deleteDoc, writeBatch, collection, query, where, getDocs, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import type { User } from '@/types';
import { createLog } from './log-service';
import { revalidatePath } from 'next/cache';

export async function deleteUser(adminId: string, adminName: string, userIdToDelete: string) {
    try {
        const userRef = doc(db, 'users', userIdToDelete);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { error: 'User not found.' };
        }

        const userToDelete = userSnap.data() as User;
        if (userToDelete.role === 'admin') {
            return { error: 'Cannot delete an admin account.' };
        }

        const dishesRef = collection(db, 'dishes');
        
        const batch = writeBatch(db);

        batch.delete(userRef);

        if (userToDelete.role === 'seller') {
            const q = query(dishesRef, where('sellerId', '==', userIdToDelete));
            const dishesSnapshot = await getDocs(q);
            dishesSnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
        }
        
        await batch.commit();
        await createLog(adminId, adminName, `Deleted user ${userToDelete.name} (${userToDelete.email})`, 'user', userIdToDelete);

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { error: 'Failed to delete user and their data.' };
    }
}

export async function deleteDishByAdmin(adminId: string, adminName: string, dishId: string) {
    try {
        const dishRef = doc(db, 'dishes', dishId);
        const dishSnap = await getDoc(dishRef);
        if(!dishSnap.exists()) return { error: 'Dish not found.' };

        const dishName = dishSnap.data().name;
        await deleteDoc(dishRef);

        await createLog(adminId, adminName, `Deleted dish "${dishName}"`, 'dish', dishId);

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting dish:", error);
        return { error: 'Failed to delete dish.' };
    }
}

export async function activateSeller(adminId: string, adminName: string, sellerId: string) {
    const userRef = doc(db, 'users', sellerId);
    try {
        const batch = writeBatch(db);
        
        batch.update(userRef, {
            isSuspended: false,
            deliveredOrderCount: 0, // Reset the counter
        });
        
        const userSnap = await getDoc(userRef);
        if(!userSnap.exists()) return { error: 'Seller not found.' };
        const sellerName = userSnap.data().name;

        // Create a notification for the seller
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
            userId: sellerId,
            message: 'Your account has been re-activated by an admin. You can now resume selling.',
            type: 'account-activated',
            createdAt: serverTimestamp(),
            isRead: false,
        });

        await batch.commit();
        
        await createLog(adminId, adminName, `Activated seller account for ${sellerName}`, 'user', sellerId);
        
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Error activating seller:", error);
        return { error: 'Failed to activate seller.' };
    }
}

export async function toggleWatchlist(adminId: string, adminName: string, userId: string) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return { error: "User not found." };
        }
        const currentStatus = userSnap.data().onWatchlist || false;
        await updateDoc(userRef, { onWatchlist: !currentStatus });

        const userName = userSnap.data().name;
        const action = !currentStatus ? 'added to' : 'removed from';
        await createLog(adminId, adminName, `${userName} was ${action} the watchlist`, 'user', userId);

        revalidatePath('/admin');
        return { success: true, newState: !currentStatus };
    } catch (error: any) {
        console.error("Error toggling watchlist:", error);
        return { error: "Failed to update watchlist status." };
    }
}
