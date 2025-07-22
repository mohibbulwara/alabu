
import type { Timestamp } from 'firebase/firestore';

export type DeliveryZone = 'inside-rangpur-city' | 'rangpur-division' | 'outside-rangpur';
export type SellerStatus = 'Top Seller' | 'Rising Star' | 'Customer Favorite' | null;

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  dishId: string;
  rating: number;
  comment: string;
  createdAt: Date | Timestamp;
}

export type DishApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface Dish {
  id:string;
  name: string;
  images: string[];
  description: string;
  category: 'Burger' | 'Pizza' | 'Drinks' | 'Dessert' | 'Biryani' | 'Kebab' | 'Set Menu' | 'Pasta' | 'Soup' | 'Salad' | 'Curry' | 'Rice' | 'Noodles' | 'Seafood' | 'Vegetarian' | 'Sandwich' | 'Breakfast' | 'Appetizers' | 'Coffee' | 'Ice Cream';
  rating: number;
  price: number;
  originalPrice?: number;
  tags?: ('Best Value' | 'Spicy' | 'New')[];
  sellerId: string;
  deliveryTime: string;
  commissionPercentage: number;
  isAvailable?: boolean;
  createdAt?: Date | Timestamp | string;
  approvalStatus?: DishApprovalStatus;
  approvalReason?: string;
  viewCount?: number;
}

export type SellerPlan = 'free' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin' | 'moderator';
  avatar: string;
  shopName?: string;
  shopAddress?: string;
  createdAt?: Date | Timestamp | string;
  zone?: DeliveryZone;
  planType?: SellerPlan;
  productUploadCount?: number;
  deliveredOrderCount?: number;
  isSuspended?: boolean;
  status?: SellerStatus;
  onWatchlist?: boolean;
}

export interface CartItem extends Dish {
  quantity: number;
}

export interface Order {
  id?: string;
  buyerId: string;
  sellerIds: string[];
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Delivered' | 'Cancelled';
  createdAt: Date | Timestamp | string;
  address: string;
  contact: string;
  shippingCost?: number;
  deliveryZone?: DeliveryZone;
  platformFee?: number;
  sellerReceives?: number;
}

export type NotificationType = 'new-order' | 'order-status' | 'new-product' | 'account-activated';

export interface Notification {
    id: string;
    userId: string; // Can be buyer or seller
    type: NotificationType;
    message: string;
    isRead: boolean;
    createdAt: Timestamp;
    orderId?: string; // Link to order
    dishId?: string; // Link to dish
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType?: 'user' | 'dish' | 'order' | 'system';
  targetId?: string;
  timestamp: Timestamp | string;
}
