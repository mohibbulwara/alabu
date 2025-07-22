'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from './language-context';
import { AuthProvider } from './auth-context';
import { CartProvider } from './cart-context';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
