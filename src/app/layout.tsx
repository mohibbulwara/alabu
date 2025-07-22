
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/contexts/app-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ptSans, spaceGrotesk } from '@/app/fonts';
import { cn } from '@/lib/utils';
import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from '@/components/theme-provider';
import BottomNavbar from '@/components/layout/bottom-navbar';

export const metadata: Metadata = {
  title: "Chefs' BD",
  description: 'Authentic flavors, delivered to your door.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          'font-body antialiased',
          ptSans.variable,
          spaceGrotesk.variable
        )}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <AppProvider>
            <NextTopLoader
              color="hsl(var(--primary))"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
            />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow pb-20 md:pb-0">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <BottomNavbar />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
