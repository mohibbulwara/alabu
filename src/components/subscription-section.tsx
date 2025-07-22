
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function SubscriptionSection() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: 'Subscribed!',
        description: `Thank you, ${email} has been added to our mailing list.`,
      });
      setEmail('');
    } else {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.section
      className="bg-background py-16 md:py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="container mx-auto">
        <Card className="max-w-3xl mx-auto overflow-hidden bg-secondary/30 border-primary/20">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-8 md:p-10">
                <CardHeader className="p-0">
                    <CardTitle className="font-headline text-3xl font-bold text-foreground">
                        Stay in the Loop
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                        Subscribe for getting our new announcements & offers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-6">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-grow">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="Your Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                        <Button type="submit" className="flex-shrink-0">
                           <Send className="mr-2 h-4 w-4" />
                            Subscribe
                        </Button>
                    </form>
                </CardContent>
            </div>
             <div className="hidden md:block relative w-full h-full">
                {/* To change this image, simply replace the src URL below with a link to your own image. */}
                <img 
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop"
                    data-ai-hint="food photography"
                    alt="Newsletter background of a pizza" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/20"></div>
             </div>
          </div>
        </Card>
      </div>
    </motion.section>
  );
}
