
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useTransition, useMemo } from 'react';
import { Clock, Loader2, Image as ImageIcon, DollarSign } from 'lucide-react';
import { uploadImage, addProduct } from '@/lib/actions';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { categories } from '@/lib/data';

const categoryNames = categories.map(c => c.name) as [string, ...string[]];

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.enum(categoryNames),
  deliveryTime: z.string().min(1, 'Delivery time is required'),
  commissionPercentage: z.coerce.number().min(5).max(10),
  image: z.any().refine(file => file?.[0], "Product image is required."),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const canAddProduct = user?.planType === 'pro' || (user?.planType === 'free' && (user?.productUploadCount ?? 0) < 5);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'seller') {
      router.push('/login');
    }
  }, [user, isAuthenticated, router]);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: 'Burger',
      deliveryTime: '',
      commissionPercentage: 5,
    },
  });
  
  const watchedPrice = form.watch('price');
  const watchedCommission = form.watch('commissionPercentage');

  const sellerReceives = useMemo(() => {
    const price = typeof watchedPrice === 'number' ? watchedPrice : 0;
    const commission = typeof watchedCommission === 'number' ? watchedCommission : 0;
    if (price > 0) {
      return price - (price * (commission / 100));
    }
    return 0;
  }, [watchedPrice, watchedCommission]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (data: ProductFormValues) => {
    if (!user || !canAddProduct) return;
    
    startSubmitTransition(async () => {
      try {
          const imageFile = data.image[0];
          const formData = new FormData();
          formData.append('image', imageFile);

          const uploadResult = await uploadImage(formData);

          if (uploadResult.error || !uploadResult.url) {
              throw new Error(uploadResult.error || 'Image upload failed');
          }

          const productData = { ...data, image: uploadResult.url };
          const result = await addProduct(productData, user.id);

          if (result.error) {
              throw new Error(result.error);
          }

          toast({ title: 'Product Added!', description: `${data.name} has been successfully added.` });
          router.push('/dashboard');
      } catch (error: any) {
          console.error("Failed to add product:", error);
          toast({ title: 'Error', description: error.message || 'Failed to add product. Please try again.', variant: 'destructive' });
      }
    });
  };

  if (!user || user.role !== 'seller') {
      return <div className="container py-12 text-center">Loading or redirecting...</div>;
  }
  
  if (!canAddProduct) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto py-12 text-center"
      >
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-destructive">Upload Limit Reached</CardTitle>
                    <CardDescription>You have reached the maximum number of product uploads for the free plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Please upgrade to the Pro plan to add more products.</p>
                    <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                </CardContent>
            </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-12"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Add a New Product</CardTitle>
          <CardDescription>Fill out the form below to list a new item in your shop.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-full aspect-video rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20 relative">
                          {imagePreview ? (
                            <Image src={imagePreview} alt="Product preview" layout="fill" objectFit="contain" className="rounded-md" />
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <ImageIcon className="mx-auto h-12 w-12" />
                              <p className="mt-2">Image Preview</p>
                            </div>
                          )}
                        </div>
                        <div className="w-full">
                           <Input 
                                type="file" 
                                accept="image/*"
                                disabled={isSubmitting}
                                onChange={(e) => {
                                  field.onChange(e.target.files);
                                  handleImageChange(e);
                                }}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Classic Beef Burger" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Product Description</FormLabel>
                      <FormControl>
                      <Textarea placeholder="Describe your product..." {...field} disabled={isSubmitting} rows={5}/>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryNames.map(name => (
                              <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <FormField
                    control={form.control}
                    name="deliveryTime"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Est. Delivery Time</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. 20-30 mins" {...field} className="pl-10" disabled={isSubmitting}/>
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (BDT)</FormLabel>
                        <FormControl>
                            <div className="relative">
                               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input type="number" placeholder="e.g. 350" {...field} className="pl-10" disabled={isSubmitting}/>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={form.control}
                      name="commissionPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Rate</FormLabel>
                          <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a commission rate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5">5%</SelectItem>
                              <SelectItem value="7">7%</SelectItem>
                              <SelectItem value="10">10%</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
              </div>

              {sellerReceives > 0 && (
                <div className="p-4 rounded-md bg-green-900/50 border border-green-500/50 text-green-300">
                    <p className="font-medium">You will receive: <span className="font-bold text-lg">৳{sellerReceives.toFixed(2)}</span></p>
                    <p className="text-xs">This is the amount you get after the {watchedCommission}% platform commission.</p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Adding Product...' : 'Add Product'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
