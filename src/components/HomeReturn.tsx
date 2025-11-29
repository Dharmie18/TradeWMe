'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export function HomeReturn() {
    const pathname = usePathname();

    // Optional: Hide on home page if desired, but user said "anywhere im at"
    // if (pathname === '/') return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link href="/">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary hover:bg-primary/10 transition-all hover:scale-110"
                    title="Return to Home"
                >
                    <Home className="h-6 w-6 text-primary" />
                    <span className="sr-only">Return to Home</span>
                </Button>
            </Link>
        </div>
    );
}
