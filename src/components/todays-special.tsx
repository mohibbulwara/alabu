
'use client';

import { Button } from './ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function TodaysSpecial() {

  const collection = {
    title: "Weekend Brunch Favorites",
    description: "Delicious and hearty options perfect for a lazy weekend brunch. Explore our best sellers!"
  };

  return (
    <section className="bg-secondary/50">
        <motion.div 
            className="container mx-auto py-16 md:py-24"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="max-w-4xl mx-auto text-center shadow-lg border-primary/20 bg-card">
              <CardHeader>
                <motion.div 
                    className="flex justify-center items-center gap-2 mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                >
                    <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <h2 className="font-headline text-3xl font-extrabold md:text-5xl text-shadow-lg text-foreground">
                        Today's Special
                    </h2>
                    <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </motion.div>
                 <CardTitle className="text-2xl md:text-3xl font-bold text-primary pt-2">
                    {collection?.title}
                </CardTitle>
                <CardDescription className="md:text-lg text-muted-foreground pt-2 h-14">
                   {collection?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 inline-block"
                >
                    <Button asChild size="lg" className="rounded-full shadow-lg font-bold text-lg px-10 py-6">
                        <Link href="/products">Explore Collection</Link>
                    </Button>
                </motion.div>
              </CardContent>
            </Card>
      </motion.div>
    </section>
  );
}
