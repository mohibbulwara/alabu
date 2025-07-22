
'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useTransition, useState } from 'react';
import MapCard from '@/components/map-card';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(1, { message: "Phone number is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(['buyer', 'seller'], { required_error: "You must select an account type."}),
  shopName: z.string().optional(),
  shopAddress: z.string().optional(),
}).refine(data => {
  if (data.role === 'seller') {
    return !!data.shopName && !!data.shopAddress;
  }
  return true;
}, {
  message: "Shop name and address are required for sellers.",
  path: ["shopAddress"],
});


type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [mapAddress, setMapAddress] = useState('');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'buyer',
      shopName: '',
      shopAddress: '',
    },
  });

  const role = form.watch('role');
  const shopAddressValue = form.watch('shopAddress');

  const handleSubmit = (data: RegisterFormValues) => {
    startTransition(async () => {
      const sellerDetails = data.role === 'seller' ? { shopName: data.shopName!, shopAddress: data.shopAddress! } : undefined;
      const success = await register(data.name, data.email, data.phone, data.password, data.role, sellerDetails);
      
      if (success) {
        toast({ title: "Registration successful!", description: "Welcome! You are now logged in." });
        router.push('/');
      }
    });
  };

  return (
    <motion.div 
      className="container flex items-center justify-center py-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t('register')}</CardTitle>
          <CardDescription>Create an account to start your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="m@example.com" {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="01..." {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="role" render={({ field }) => ( <FormItem className="space-y-2"><FormLabel>Account Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 pt-2" disabled={isPending}><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="buyer" /></FormControl><FormLabel className="font-normal">Buyer</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="seller" /></FormControl><FormLabel className="font-normal">Seller</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem> )} />
              
              {role === 'seller' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden space-y-4">
                  <FormField control={form.control} name="shopName" render={({ field }) => ( <FormItem><FormLabel>Shop Name</FormLabel><FormControl><Input placeholder="e.g. Burger Queen" {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="shopAddress" render={({ field }) => ( <FormItem><FormLabel>Shop Address</FormLabel><FormControl><Input placeholder="123 Main St, Dhaka" {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
                   {shopAddressValue && (
                     <div className="space-y-4">
                        <Button type="button" variant="outline" size="sm" onClick={() => setMapAddress(shopAddressValue)}>Preview Map</Button>
                        {mapAddress && <MapCard address={mapAddress} />}
                     </div>
                   )}
                </motion.div>
              )}
              
              <Button type="submit" className="w-full" disabled={isPending}>
                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {isPending ? "Creating Account..." : t('register')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-primary">
              {t('login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
