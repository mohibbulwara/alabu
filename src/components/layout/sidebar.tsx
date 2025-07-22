
'use client';

import { useAuth, useLanguage } from '@/lib/hooks';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { CookingPot, Home, LayoutDashboard, History, ShoppingBag, User } from 'lucide-react';
import LanguageSwitcher from '../language-switcher';

export default function AppSidebar() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: t('home'), icon: Home, roles: ['buyer', 'seller'] },
    { href: '/products', label: t('products'), icon: ShoppingBag, roles: ['buyer', 'seller'] },
    { href: '/orders', label: t('previousOrders'), icon: History, roles: ['buyer'] },
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: ['seller'] },
    { href: '/profile', label: t('profile'), icon: User, roles: ['buyer', 'seller'] },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <CookingPot className="h-6 w-6" />
          </div>
          <span className="font-bold text-lg font-headline text-sidebar-foreground">
            {t('appName')}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => {
            if (isAuthenticated && user && link.roles.includes(user.role)) {
              const Icon = link.icon;
              return (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(link.href)}
                      tooltip={link.label}
                    >
                      <a>
                        <Icon />
                        <span>{link.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            }
            // Show Home and Products for logged-out users
            if (!isAuthenticated && (link.href === '/' || link.href === '/products')) {
                 const Icon = link.icon;
                 return (
                    <SidebarMenuItem key={link.href}>
                        <Link href={link.href} passHref legacyBehavior>
                            <SidebarMenuButton
                            asChild
                            isActive={isActive(link.href)}
                            tooltip={link.label}
                            >
                            <a>
                                <Icon />
                                <span>{link.label}</span>
                            </a>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                 )
            }
            return null;
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <LanguageSwitcher />
      </SidebarFooter>
    </Sidebar>
  );
}
