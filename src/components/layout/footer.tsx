'use client';

import { useLanguage } from '@/lib/hooks';
import Link from 'next/link';
import { CookingPot, Twitter, Instagram, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
                 <Link href="/" className="mb-4 flex items-center space-x-2">
                    <CookingPot className="h-8 w-8 text-primary" />
                    <span className="font-bold font-headline text-2xl text-primary tracking-wide">{t('appName')}</span>
                </Link>
                <p className="text-sm text-muted-foreground max-w-xs">{t('heroSubtitle')}</p>
                <div className="flex gap-4 mt-6">
                    <motion.a href="#" whileHover={{ scale: 1.2, color: 'hsl(var(--primary))' }} className="text-muted-foreground"><Twitter /></motion.a>
                    <motion.a href="#" whileHover={{ scale: 1.2, color: 'hsl(var(--primary))' }} className="text-muted-foreground"><Instagram /></motion.a>
                    <motion.a href="#" whileHover={{ scale: 1.2, color: 'hsl(var(--primary))' }} className="text-muted-foreground"><Facebook /></motion.a>
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
                <ul className="space-y-2">
                    <li><Link href="/products" className="text-sm text-muted-foreground hover:text-primary">Products</Link></li>
                    <li><Link href="/cart" className="text-sm text-muted-foreground hover:text-primary">My Cart</Link></li>
                    <li><Link href="/register" className="text-sm text-muted-foreground hover:text-primary">Become a Seller</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold mb-4 text-foreground">Support</h4>
                <ul className="space-y-2">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
                <ul className="space-y-2">
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                    <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                </ul>
            </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {t('appName')}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
