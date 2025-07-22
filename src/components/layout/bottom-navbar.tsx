
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ChefHat, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/hooks';
import { Badge } from '../ui/badge';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/sellers', label: 'Sellers', icon: ChefHat },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-lg border-t border-border/40 z-50">
      <nav className="h-full">
        <ul className="flex h-full items-center justify-around">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href} className="relative flex flex-col items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-primary">
                  {link.href === '/cart' && cartCount > 0 && (
                     <Badge variant="destructive" className="absolute -top-1 -right-2 h-4 w-4 justify-center rounded-full p-0 text-[10px] border border-background">
                        {cartCount}
                     </Badge>
                  )}
                  <motion.div
                     animate={{ 
                        color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                        scale: isActive ? 1.05 : 1,
                        y: isActive ? -2 : 0,
                     }}
                     transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <link.icon className="h-5 w-5" />
                  </motion.div>
                  <span className={`text-[10px] ${isActive ? 'font-bold text-primary' : ''}`}>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
