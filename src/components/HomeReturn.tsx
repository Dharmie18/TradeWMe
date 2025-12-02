'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HomeReturn() {
    return (
        <Link href="/">
            <Button
                size="icon"
                className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/30 hover:bg-primary/90 group"
                aria-label="Return to home"
            >
                <Home className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
            </Button>
        </Link>
    );
}
