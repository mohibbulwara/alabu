
'use client';

import { useCart } from '@/lib/hooks';
import { useAuth } from '@/lib/hooks';
import { useLanguage } from '@/lib/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useState, useMemo } from 'react';
import { calculateShippingCost } from '@/lib/utils';
import type { DeliveryZone } from '@/types';
import CartItem from '@/components/cart-item';
import { getUserById } from '@/lib/services/user-service';

const deliveryZones: { value: DeliveryZone, label: string }[] = [
  { value: 'inside-rangpur-city', label: 'Inside Rangpur City' },
  { value: 'rangpur-division', label: 'Rangpur Division' },
  { value: 'outside-rangpur', label: 'Outside Rangpur' },
];

export default function CartPage() {
  const { cart, clearCart, cartCount, cartTotal } = useCart();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | undefined>();

  const shippingCost = useMemo(() => {
    // This is a simplified calculation. A real-world scenario would be more complex,
    // potentially involving fetching seller data here. For now, we use a default.
    if (!deliveryZone || cart.length === 0) return 0;
    return 60; // Default shipping cost
  }, [cart, deliveryZone]);
  
  const finalTotal = cartTotal + shippingCost;

  const isCheckoutDisabled = !address || !contact || !deliveryZone || isLoading || cart.length === 0;

  const handlePlaceOrder = async () => {
    if (!user || !cart.length || isCheckoutDisabled) return;
    setIsLoading(true);

    const sellerIds = [...new Set(cart.map(item => item.sellerId))];

    try {
      const orderData = {
        buyerId: user.id,
        sellerIds: sellerIds,
        items: cart,
        total: finalTotal,
        status: 'Pending' as const,
        createdAt: serverTimestamp(),
        address: address,
        contact: contact,
        shippingCost: shippingCost,
        deliveryZone: deliveryZone,
      };

      // Create the order document
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      const batch = writeBatch(db);

      // Create notifications for each seller
      for (const sellerId of sellerIds) {
          const seller = await getUserById(sellerId);
          const notificationRef = doc(collection(db, 'notifications'));
          batch.set(notificationRef, {
              userId: sellerId,
              orderId: orderRef.id,
              message: `New order #${orderRef.id.substring(0, 6)} received from ${user.name}.`,
              type: 'new-order',
              createdAt: serverTimestamp(),
              isRead: false,
          });
      }

      // Create a notification for the buyer
      const buyerNotificationRef = doc(collection(db, 'notifications'));
      batch.set(buyerNotificationRef, {
          userId: user.id,
          orderId: orderRef.id,
          message: `Your order #${orderRef.id.substring(0, 6)} has been placed successfully.`,
          type: 'order-status',
          createdAt: serverTimestamp(),
          isRead: false,
      });

      await batch.commit();

      toast({ title: 'Order Placed!', description: 'Your order has been successfully placed.' });
      clearCart();
      router.push('/orders');

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({ title: 'Error', description: 'Failed to place order. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="container mx-auto py-8 md:py-12">
      <h1 className="text-center font-headline text-3xl md:text-4xl font-bold text-primary mb-8">
        {t('cart')}
      </h1>
      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4">
            <Link href="/products">{t('browseDishes')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address</Label>
                        <Textarea 
                          id="address" 
                          placeholder="Enter your full address" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="zone">Delivery Zone</Label>
                         <Select onValueChange={(value) => setDeliveryZone(value as DeliveryZone)}>
                            <SelectTrigger id="zone-select">
                                <SelectValue placeholder="Select delivery zone" />
                            </SelectTrigger>
                            <SelectContent>
                                {deliveryZones.map((zone) => (
                                    <SelectItem key={zone.value} value={zone.value}>
                                    {zone.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contact">Contact Number</Label>
                        <Input 
                          id="contact" 
                          type="tel"
                          placeholder="Enter your mobile number" 
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          required
                        />
                    </div>
                    <div className="flex justify-between">
                        <span>Subtotal ({cartCount} items)</span>
                        <span>৳{cartTotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>৳{shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4 mt-2">
                        <span>Total</span>
                        <span>৳{finalTotal.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                  {isAuthenticated ? (
                     <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isCheckoutDisabled}>
                       {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       {isLoading ? 'Placing Order...' : 'Place Order'}
                     </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full" size="lg">Place Order</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                          <AlertDialogDescription>
                            You need to be logged in to place an order. Please log in to continue.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLoginRedirect}>
                            Login
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardFooter>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
