
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useCart, useLanguage } from '@/lib/hooks';
import { Badge } from '@/components/ui/badge';
import { CookingPot, ShoppingCart, User as UserIcon, Bell, Menu, LogIn, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, writeBatch } from 'firebase/firestore';
import type { Notification } from '@/types';
import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"


export default function Header() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { cartCount } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/products', label: t('products') },
    { href: '/sellers', label: 'Sellers' },
    { href: '/orders', label: t('previousOrders'), roles: ['buyer'] },
    { href: '/dashboard', label: t('dashboard'), roles: ['seller'] },
  ];

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    const batch = writeBatch(db);
    notifications.forEach(notification => {
        if (!notification.isRead) {
            const notifRef = doc(db, 'notifications', notification.id);
            batch.update(notifRef, { isRead: true });
        }
    });
    await batch.commit();
  };
  
  const getNotificationLink = (notification: Notification) => {
      if (notification.type === 'order-status' && notification.orderId) return '/orders';
      if (notification.type === 'new-product' && notification.productId) return `/product/${notification.productId}`;
      if (notification.type === 'new-order' && user?.role === 'seller') return '/dashboard';
      return '#';
  }

  const MotionLink = motion(Link);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <MotionLink 
          href="/" 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CookingPot className="h-8 w-8 text-primary" />
          <span className="font-bold font-headline text-xl tracking-wide">{t('appName')}</span>
        </MotionLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-2">
          {navLinks.map((link) => {
            const showLink = !link.roles || (isAuthenticated && user && link.roles.includes(user.role));
            if (!showLink) return null;
            const isActive = pathname === link.href;
            return (
              <MotionLink
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 -z-10 rounded-full bg-muted"
                    layoutId="active-nav-pill"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </MotionLink>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-2">
          
          <motion.div
            whileTap={{ scale: 0.9 }}
            className='md:hidden'
          >
             <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                 <Button variant="ghost" size="icon">
                    <Menu />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                   <SheetTitle className='flex items-center gap-2'>
                      <CookingPot className="h-6 w-6 text-primary" />
                      <span>{t('appName')}</span>
                   </SheetTitle>
                </SheetHeader>
                 <nav className="flex flex-col items-start gap-4 py-8">
                    {navLinks.map((link) => {
                      const showLink = !link.roles || (isAuthenticated && user && link.roles.includes(user.role));
                      if (!showLink) return null;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`text-lg ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                  {loading ? null : isAuthenticated && user ? (
                    <div className="mt-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" className="w-full justify-start gap-2">
                              <UserIcon className="h-5 w-5" />
                              <span>{user.name}</span>
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild><Link href="/profile">My Profile</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="mt-auto flex flex-col gap-2">
                      <Button asChild variant="outline"><Link href="/login"><LogIn className="mr-2"/>{t('login')}</Link></Button>
                      <Button asChild><Link href="/register"><UserPlus className="mr-2"/>{t('register')}</Link></Button>
                    </div>
                  )}
              </SheetContent>
            </Sheet>
          </motion.div>

          {isAuthenticated && user && (
            <Popover>
              <PopoverTrigger asChild>
                  <motion.button className="relative rounded-full p-2 transition-colors hover:bg-accent" whileTap={{ scale: 0.9 }}>
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                           <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs border-2 border-background">
                              {unreadCount}
                           </Badge>
                      )}
                      <span className="sr-only">Notifications</span>
                  </motion.button>
              </PopoverTrigger>
               <PopoverContent align="end" className="w-80">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Notifications</h4>
                    {unreadCount > 0 && <Button variant="link" size="sm" onClick={markAllAsRead}>Mark all as read</Button>}
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <Link key={notif.id} href={getNotificationLink(notif)} className={`block p-2 rounded-md hover:bg-accent ${!notif.isRead && 'bg-primary/10'}`}>
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-muted-foreground">{formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })}</p>
                        </Link>
                      ))
                    ) : <p className="text-sm text-muted-foreground text-center py-4">No notifications yet.</p>}
                  </div>
              </PopoverContent>
            </Popover>
          )}

          <motion.a href="/sellers" className="relative rounded-full p-2 transition-colors hover:bg-accent" whileTap={{ scale: 0.9 }} title="Find Sellers">
            <Search className="h-5 w-5" />
            <span className="sr-only">Find Sellers</span>
          </motion.a>

          <motion.a href="/cart" className="relative rounded-full p-2 transition-colors hover:bg-accent" whileTap={{ scale: 0.9 }}>
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs border-2 border-background">
                {cartCount}
              </Badge>
            )}
            <span className="sr-only">{t('cart')}</span>
          </motion.a>

          {loading ? null : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <motion.button className="relative hidden sm:inline-flex rounded-full p-2 transition-colors hover:bg-accent" whileTap={{ scale: 0.9 }}>
                    <UserIcon className="h-5 w-5" />
                    <span className="sr-only">User Menu</span>
                 </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile">My Profile</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
               <Button asChild variant="ghost"><Link href="/login"><LogIn className="mr-2"/>{t('login')}</Link></Button>
               <Button asChild><Link href="/register"><UserPlus className="mr-2"/>{t('register')}</Link></Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
