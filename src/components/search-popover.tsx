
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchPopoverProps {
  onSearch: () => void;
}

export default function SearchPopover({ onSearch }: SearchPopoverProps) {
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [sellerSearchTerm, setSellerSearchTerm] = useState('');
  const router = useRouter();

  const handleProductSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (productSearchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(productSearchTerm)}`);
      onSearch();
    }
  };

  const handleSellerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (sellerSearchTerm.trim()) {
      router.push(`/sellers?search=${encodeURIComponent(sellerSearchTerm)}`);
      onSearch();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <form onSubmit={handleProductSearch} className="flex w-full items-center space-x-2 pt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for dishes..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </TabsContent>
        <TabsContent value="sellers">
          <form onSubmit={handleSellerSearch} className="flex w-full items-center space-x-2 pt-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search for kitchens..."
                    value={sellerSearchTerm}
                    onChange={(e) => setSellerSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
