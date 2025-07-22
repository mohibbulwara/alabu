
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { addDoc, collection, serverTimestamp, doc, runTransaction, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/firebase';
import type { User, Product } from '@/types';
import { getAllBuyers } from './services/user-service';

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

export async function addProduct(productData: any, userId: string) {
    const { name, description, price, category, deliveryTime, image, commissionPercentage } = productData;

    try {
        const userRef = doc(db, "users", userId);
        
        const { newProductId, sellerData } = await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "User does not exist!";
            }
            
            const userData = userDoc.data() as User;
            const currentUploads = userData.productUploadCount || 0;
            
            if (userData.planType === 'free' && currentUploads >= 5) {
                throw "Upload limit for free plan reached.";
            }

            const productDocRef = doc(collection(db, "products"));
            transaction.set(productDocRef, {
                name,
                description,
                price: Number(price),
                category,
                deliveryTime,
                image, // This is the Cloudinary URL
                commissionPercentage: Number(commissionPercentage),
                sellerId: userId,
                rating: Math.floor(Math.random() * 3) + 3, // Random initial rating between 3 and 5
                createdAt: serverTimestamp(),
                isAvailable: true, // New products are available by default
            });

            // Increment productUploadCount
            transaction.update(userRef, { productUploadCount: currentUploads + 1 });

            return { newProductId: productDocRef.id, sellerData: userData };
        });
        
        // After transaction is successful, create notifications for all buyers
        const buyers = await getAllBuyers();
        const notificationBatch = writeBatch(db);
        buyers.forEach(buyer => {
            const notificationRef = doc(collection(db, 'notifications'));
            notificationBatch.set(notificationRef, {
                userId: buyer.id,
                productId: newProductId,
                message: `New product added: ${name} by ${sellerData.shopName || sellerData.name}`,
                type: 'new-product',
                createdAt: serverTimestamp(),
                isRead: false,
            });
        });
        await notificationBatch.commit();


        return { success: true, productId: newProductId };
    } catch (error: any) {
        console.error("Error adding product transactionally: ", error);
        return { error: typeof error === 'string' ? error : "Failed to add product." };
    }
}

export async function updateProduct(productId: string, productData: Partial<Product>) {
    const productRef = doc(db, "products", productId);

    try {
        const dataToUpdate: Record<string, any> = {};

        if (productData.name !== undefined) dataToUpdate.name = productData.name;
        if (productData.description !== undefined) dataToUpdate.description = productData.description;
        if (productData.price !== undefined) dataToUpdate.price = Number(productData.price);
        if (productData.category !== undefined) dataToUpdate.category = productData.category;
        if (productData.deliveryTime !== undefined) dataToUpdate.deliveryTime = productData.deliveryTime;
        if (productData.image !== undefined) dataToUpdate.image = productData.image;
        if (productData.commissionPercentage !== undefined) dataToUpdate.commissionPercentage = Number(productData.commissionPercentage);
        if (productData.isAvailable !== undefined) dataToUpdate.isAvailable = productData.isAvailable;

        await updateDoc(productRef, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error updating product: ", error);
        return { error: "Failed to update product." };
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
