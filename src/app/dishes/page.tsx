
'use client';
// This page is now redundant as the main page handles dish listing.
// We can redirect or show a simplified version. For now, let's redirect.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function DishesRedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        router.replace('/' + (params.toString() ? '?' + params.toString() : ''));
    }, [router, searchParams]);

    return (
        <div className="container mx-auto py-12 text-center">
            <p>Redirecting to the main page...</p>
        </div>
    );
}
