
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

const categoryNames = ['All', ...categories.map(c => c.name)];

interface DishFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    rating: number;
    setRating: (value: number) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
}

export default function DishFilters({
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    rating,
    setRating,
    sortBy,
    setSortBy
}: DishFiltersProps) {
    const { t } = useLanguage();
    
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
