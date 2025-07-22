
'use client';

import { useLanguage } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import RatingInput from '@/components/rating-input';
import { X, Search } from 'lucide-react';
import { categories } from '@/lib/data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

const categoryNames = ['All', ...categories.map(c => c.name)];

export default function ProductFilters() {
    const { t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for controlled components, initialized from URL
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [rating, setRating] = useState(Number(searchParams.get('rating')) || 0);
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating-desc');
    
    const [debouncedSearch] = useDebounce(searchTerm, 500);

    const createQueryString = useCallback(
        (paramsToUpdate: Record<string, string | number | undefined>) => {
          const params = new URLSearchParams(searchParams.toString())
          
          for (const [name, value] of Object.entries(paramsToUpdate)) {
            if (value !== undefined && value !== null && String(value).length > 0) {
                params.set(name, String(value));
            } else {
                params.delete(name);
            }
          }
     
          return params.toString()
        },
        [searchParams]
    );

    useEffect(() => {
        const query = createQueryString({ 
            search: debouncedSearch ? debouncedSearch : undefined,
            category: category === 'All' ? undefined : category,
            rating: rating > 0 ? rating : undefined,
            sortBy: sortBy,
        });
        router.replace(pathname + (query ? '?' + query : ''), { scroll: false });
    }, [debouncedSearch, category, rating, sortBy, router, pathname, createQueryString]);

    const clearFilters = () => {
        setSearchTerm('');
        setCategory('All');
        setRating(0);
        setSortBy('rating-desc');
    };

    return (
        <div className="space-y-8">
             <div>
                <Label htmlFor="search" className="text-lg font-semibold">Search</Label>
                <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search"
                        type="text"
                        placeholder="Search dishes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div>
                <Label className="text-lg font-semibold">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select sorting" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rating-desc">Best Rating</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label className="text-lg font-semibold">Category</Label>
                <RadioGroup value={category} onValueChange={setCategory} className="mt-2 space-y-1">
                    {categoryNames.map((cat) => (
                        <div key={cat} className="flex items-center">
                            <RadioGroupItem value={cat} id={`cat-${cat}`} />
                            <Label htmlFor={`cat-${cat}`} className="ml-2 font-normal">
                                {cat === 'All' ? t('all') : cat}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <div>
                <Label className="text-lg font-semibold">{t('filterByRating')}</Label>
                <div className="mt-2 flex items-center space-x-2">
                    <RatingInput value={rating} onChange={setRating} />
                    {rating > 0 && (
                        <Button onClick={() => setRating(0)} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
                            <X className="h-4 w-4"/>
                            <span className="sr-only">Clear rating</span>
                        </Button>
                    )}
                </div>
            </div>

            <div>
                 <Button onClick={clearFilters} variant="outline" className="w-full">Clear All Filters</Button>
            </div>
        </div>
    );
}
