
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { addDoc, collection, serverTimestamp, doc, runTransaction, updateDoc, writeBatch, increment } from 'firebase/firestore';
import { db } from '@/firebase';
import type { User, Dish } from '@/types';
import { getAllBuyers } from './services/user-service';
// import { analyzeDishForApproval } from '@/ai/flows/dish-approval-flow';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File;
  if (!file) {
    return { error: 'No image file provided.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    const result = await new Promise<{ secure_url: string; public_id: string; }>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "chefs-bd" }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if(result) {
                resolve(result);
            } else {
                reject(new Error("Cloudinary upload failed"));
            }
        }).end(buffer);
    });

    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('Upload failed', error);
    return { error: 'Image upload failed.' };
  }
}

export async function addDish(dishData: any, userId: string) {
    const { name, description, price, originalPrice, category, deliveryTime, images, commissionPercentage, tags } = dishData;

    try {
        const userRef = doc(db, "users", userId);
        
        const { newDishId, sellerData } = await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "User does not exist!";
            }
            
            const userData = userDoc.data() as User;
            const currentUploads = userData.productUploadCount || 0;

            const dishDocRef = doc(collection(db, "dishes"));

            transaction.set(dishDocRef, {
                name,
                description,
                price: Number(price),
                originalPrice: originalPrice ? Number(originalPrice) : null,
                category,
                deliveryTime,
                images, // This is the array of Cloudinary URLs
                commissionPercentage: Number(commissionPercentage),
                tags: tags || [],
                sellerId: userId,
                rating: Math.floor(Math.random() * 3) + 3,
                createdAt: serverTimestamp(),
                isAvailable: true,
                approvalStatus: 'approved', // Dishes are auto-approved for now
                viewCount: 0,
            });

            transaction.update(userRef, { productUploadCount: currentUploads + 1 });

            return { newDishId: dishDocRef.id, sellerData: userData };
        });
        
        const buyers = await getAllBuyers();
        const notificationBatch = writeBatch(db);
        buyers.forEach(buyer => {
            const notificationRef = doc(collection(db, 'notifications'));
            notificationBatch.set(notificationRef, {
                userId: buyer.id,
                dishId: newDishId,
                message: `New dish added: ${name} by ${sellerData.shopName || sellerData.name}`,
                type: 'new-product',
                createdAt: serverTimestamp(),
                isRead: false,
            });
        });
        await notificationBatch.commit();


        return { success: true, dishId: newDishId };
    } catch (error: any) {
        console.error("Error adding dish transactionally: ", error);
        return { error: typeof error === 'string' ? error : "Failed to add dish." };
    }
}

export async function updateDish(dishId: string, dishData: Partial<Dish>) {
    const dishRef = doc(db, "dishes", dishId);

    try {
        const dataToUpdate: Record<string, any> = {};

        if (dishData.name !== undefined) dataToUpdate.name = dishData.name;
        if (dishData.description !== undefined) dataToUpdate.description = dishData.description;
        if (dishData.price !== undefined) dataToUpdate.price = Number(dishData.price);
        if (dishData.originalPrice !== undefined) dataToUpdate.originalPrice = dishData.originalPrice ? Number(dishData.originalPrice) : null;
        if (dishData.category !== undefined) dataToUpdate.category = dishData.category;
        if (dishData.deliveryTime !== undefined) dataToUpdate.deliveryTime = dishData.deliveryTime;
        if (dishData.images !== undefined) dataToUpdate.images = dishData.images;
        if (dishData.commissionPercentage !== undefined) dataToUpdate.commissionPercentage = Number(dishData.commissionPercentage);
        if (dishData.tags !== undefined) dataToUpdate.tags = dishData.tags;
        if (dishData.isAvailable !== undefined) dataToUpdate.isAvailable = dishData.isAvailable;
        if (dishData.approvalStatus !== undefined) dataToUpdate.approvalStatus = dishData.approvalStatus;
        if (dishData.approvalReason !== undefined) dataToUpdate.approvalReason = dishData.approvalReason;

        await updateDoc(dishRef, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error updating dish: ", error);
        return { error: "Failed to update dish." };
    }
}

export async function updateUser(userId: string, userData: Partial<Pick<User, 'name' | 'phone' | 'shopName' | 'shopAddress' | 'avatar'>>) {
    const userRef = doc(db, "users", userId);
    try {
        const dataToUpdate: Record<string, any> = {};
        if (userData.name) dataToUpdate.name = userData.name;
        if (userData.phone) dataToUpdate.phone = userData.phone;
        if (userData.shopName) dataToUpdate.shopName = userData.shopName;
        if (userData.shopAddress) dataToUpdate.shopAddress = userData.shopAddress;
        if (userData.avatar) dataToUpdate.avatar = userData.avatar;

        if (Object.keys(dataToUpdate).length === 0) {
            return { success: true }; // Nothing to update
        }

        await updateDoc(userRef, dataToUpdate);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user: ", error);
        return { error: "Failed to update profile." };
    }
}


export async function incrementDishViewCount(dishId: string) {
  if (!dishId) return;
  const dishRef = doc(db, 'dishes', dishId);
  try {
    // Use the atomic `increment` operation from Firestore
    await updateDoc(dishRef, {
      viewCount: increment(1)
    });
  } catch (error) {
    // Log the error but don't block the user from seeing the page.
    console.error("Failed to increment dish view count for dish " + dishId, error);
  }
}
