
'use client';

import { useAuth } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Store, MapPin, Loader2, UploadCloud, Phone, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MapCard from '@/components/map-card';
import { updateUser, uploadImage } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [mapPreviewAddress, setMapPreviewAddress] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);
  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setShopName(user.shopName || '');
      setShopAddress(user.shopAddress || '');
      setMapPreviewAddress(user.shopAddress || '');
      setImagePreview(user.avatar);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = async (textToCopy: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({ title: 'Copied!', description: `${fieldName} copied to clipboard.` });
    } catch (err) {
      toast({ title: 'Error', description: `Failed to copy ${fieldName}.`, variant: 'destructive' });
      console.error('Failed to copy text: ', err);
    }
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    startTransition(async () => {
      try {
        let newAvatarUrl = user.avatar;
        if (avatarFile) {
            const formData = new FormData();
            formData.append('image', avatarFile);
            const uploadResult = await uploadImage(formData);
            if (uploadResult.error || !uploadResult.url) {
                throw new Error(uploadResult.error || 'Image upload failed');
            }
            newAvatarUrl = uploadResult.url;
        }

        const userData = { name, phone, shopName, shopAddress, avatar: newAvatarUrl };
        const result = await updateUser(user.id, userData);

        if (result.success) {
          toast({ title: 'Profile Updated!', description: 'Your information has been saved.' });
          await refreshUser(); // Refetch user data from context
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || "Failed to update profile.", variant: 'destructive' });
      }
    });
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="md:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
                 <Card>
                    <CardHeader className="items-center text-center">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2 mt-4">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Display Card */}
        <motion.div 
          className="md:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
            <Card>
                <CardHeader className="items-center text-center p-6">
                    <Avatar className="h-24 w-24 text-4xl mb-4 border-4 border-primary">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
                    <CardDescription>{user.role === 'seller' ? 'Seller Account' : 'Buyer Account'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-6 pb-6">
                    <div className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50 border">
                        <div className="flex items-center gap-4 truncate">
                            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-sm truncate">{user.email}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleCopy(user.email, 'Email')}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy Email</span>
                        </Button>
                    </div>
                    {user.phone && (
                       <div className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50 border">
                           <div className="flex items-center gap-4 truncate">
                                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                                <span className="text-sm">{user.phone}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleCopy(user.phone!, 'Phone number')}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy Phone Number</span>
                            </Button>
                       </div>
                    )}
                    {user.role === 'seller' && user.shopName && (
                        <div className="flex items-center gap-4 p-3 rounded-md bg-muted/50 border">
                            <Store className="h-5 w-5 text-primary" />
                            <span className="text-sm">{user.shopName}</span>
                        </div>
                    )}
                    {user.role === 'seller' && user.shopAddress && (
                        <div className="flex items-start gap-4 p-3 rounded-md bg-muted/50 border">
                            <MapPin className="h-5 w-5 text-primary mt-1" />
                            <span className="text-sm">{user.shopAddress}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>

        {/* Edit Form Card */}
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
           <Card>
                <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>Update your personal and shop information here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                         <div className="flex flex-col items-center gap-4">
                            <Label htmlFor="avatar-upload" className="cursor-pointer">
                                <div className="w-32 h-32 rounded-full border-4 border-dashed border-border flex items-center justify-center bg-muted/20 relative group overflow-hidden">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Avatar preview" layout="fill" objectFit="cover" className="rounded-full" />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <User className="mx-auto h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <UploadCloud className="h-8 w-8"/>
                                </div>
                                </div>
                            </Label>
                            <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isPending} />
                            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()} disabled={isPending}>
                                Change Picture
                            </Button>
                         </div>

                         <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                                id="name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-2"
                                disabled={isPending}
                            />
                        </div>
                         <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                                id="phone" 
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-2"
                                disabled={isPending}
                            />
                        </div>
                        
                        {user.role === 'seller' && (
                            <>
                                <div>
                                    <Label htmlFor="shopName">Shop Name</Label>
                                    <Input 
                                        id="shopName" 
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        className="mt-2"
                                        disabled={isPending}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="shopAddress">Shop Address</Label>
                                    <Input 
                                        id="shopAddress"
                                        value={shopAddress}
                                        onChange={(e) => setShopAddress(e.target.value)}
                                        className="mt-2"
                                        disabled={isPending}
                                    />
                                </div>
                                {shopAddress && (
                                     <div className="space-y-4">
                                        <Button type="button" variant="outline" onClick={() => setMapPreviewAddress(shopAddress)}>
                                            Preview Map
                                        </Button>
                                        {mapPreviewAddress && <MapCard address={mapPreviewAddress} />}
                                    </div>
                                )}
                            </>
                        )}

                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
           </Card>
        </motion.div>
      </div>
    </div>
  );
}
