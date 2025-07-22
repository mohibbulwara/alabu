
'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, User, Building, ArrowLeft } from 'lucide-react';
import { useTransition, useState } from 'react';
import MapCard from '@/components/map-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import FormStep from '@/components/form-step';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.24,44,34,44,31C44,26.93,44,22.659,43.611,20.083z"/></svg>
)

const registerSchema = z.object({
  role: z.enum(['buyer', 'seller'], { required_error: "You must select an account type."}),
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(1, { message: "Phone number is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
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
  const { register, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [mapAddress, setMapAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      shopName: '',
      shopAddress: '',
    },
  });

  const role = form.watch('role');
  const shopAddressValue = form.watch('shopAddress');
  const totalSteps = role === 'seller' ? 3 : 2;

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormValues)[] = [];
    if (currentStep === 0) fieldsToValidate = ['role'];
    if (currentStep === 1) fieldsToValidate = ['name', 'email', 'phone', 'password'];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (role === 'buyer' && currentStep === 1) {
         form.handleSubmit(handleSubmit)();
      } else {
        setCurrentStep(step => step + 1);
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(step => step - 1);
  };
  
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

  const handleGoogleLogin = () => {
      startTransition(async () => {
          const success = await loginWithGoogle();
          if (success) {
              toast({ title: "Registration successful!" });
              router.push('/');
          }
      })
  }

  const progress = ((currentStep + 1) / (totalSteps + 1)) * 100;

  return (
    <div 
      className="container flex min-h-[90vh] items-center justify-center py-12"
    >
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}>
            <Progress value={progress} className="h-2" />
          </motion.div>
          
          <div className="flex items-center gap-4 pt-4">
             {currentStep > 0 && (
              <Button variant="ghost" size="icon" onClick={handlePrevStep} disabled={isPending}>
                <ArrowLeft />
              </Button>
            )}
            <div>
              <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
              <CardDescription>Step {currentStep + 1} of {totalSteps}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                <FormStep key={currentStep} currentStep={currentStep}>
                  {/* Step 0: Account Type */}
                  {currentStep === 0 && (
                     <div className="space-y-4">
                      <FormField control={form.control} name="role" render={({ field }) => ( 
                        <FormItem>
                          <FormLabel className="sr-only">Account Type</FormLabel>
                          <FormMessage />
                          <div className="grid grid-cols-2 gap-4">
                             <motion.div whileTap={{ scale: 0.95 }}>
                                <div onClick={() => { field.onChange('buyer'); handleNextStep(); }} className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${field.value === 'buyer' ? 'border-primary' : 'border-border'}`}>
                                  <User className="mx-auto h-12 w-12 mb-2" />
                                  <h3 className="font-semibold">I'm a Buyer</h3>
                                </div>
                             </motion.div>
                             <motion.div whileTap={{ scale: 0.95 }}>
                                <div onClick={() => { field.onChange('seller'); handleNextStep(); }} className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${field.value === 'seller' ? 'border-primary' : 'border-border'}`}>
                                  <Building className="mx-auto h-12 w-12 mb-2" />
                                  <h3 className="font-semibold">I'm a Seller</h3>
                                </div>
                            </motion.div>
                          </div>
                        </FormItem>
                      )} />
                     </div>
                  )}

                  {/* Step 1: Account Details */}
                  {currentStep === 1 && (
                     <div className="space-y-4">
                        <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isPending}>
                          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5"/>}
                          Sign up with Google
                        </Button>
                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or with email</span></div>
                        </div>
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} disabled={isPending} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="m@example.com" {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="01..." {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
                        <Button type="button" className="w-full" onClick={handleNextStep}>
                          {role === 'seller' ? 'Next' : 'Create Account'}
                        </Button>
                     </div>
                  )}

                  {/* Step 2: Seller Details */}
                  {currentStep === 2 && role === 'seller' && (
                     <div className="space-y-4">
                        <FormField control={form.control} name="shopName" render={({ field }) => ( <FormItem><FormLabel>Shop Name</FormLabel><FormControl><Input placeholder="e.g. Burger Queen" {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="shopAddress" render={({ field }) => ( <FormItem><FormLabel>Shop Address</FormLabel><FormControl><Input placeholder="123 Main St, Dhaka" {...field} disabled={isPending}/></FormControl><FormMessage /></FormItem> )} />
                        {shopAddressValue && (
                          <div className="space-y-4">
                              <Button type="button" variant="outline" size="sm" onClick={() => setMapAddress(shopAddressValue)}>Preview Map</Button>
                              {mapAddress && <MapCard address={mapAddress} />}
                          </div>
                        )}
                        <Button type="submit" className="w-full" disabled={isPending}>
                          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isPending ? "Creating Account..." : "Create Account"}
                        </Button>
                     </div>
                  )}
                </FormStep>
              </AnimatePresence>
            </form>
          </Form>

           {currentStep === 0 && (
             <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-primary">
                {t('login')}
              </Link>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
