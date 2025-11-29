'use client';

import { useSession } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp } from 'lucide-react';

/**
 * UserProfileHeader component displays user info and market index
 * Shows user avatar, name, and current trading index with live updates
 */
export function UserProfileHeader() {
    const { data: session } = useSession();

    // Mock index data - in production, fetch real market data
    const marketIndex = {
        name: 'Index',
        value: 9880.6,
        change: 70.10,
        changePercent: 1.39,
    };

    const getUserInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-blue-400/10 backdrop-blur-sm border border-blue-500/20 animate-fade-in">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-blue-500/30">
                    <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-xl">
                        {getUserInitials(session?.user?.name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">{session?.user?.name || 'User'}</h2>
                    <p className="text-sm text-muted-foreground">Money Obtained</p>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-6 bg-card/50 px-6 py-3 rounded-lg border border-border/50">
                <div>
                    <p className="text-sm text-muted-foreground">{marketIndex.name}</p>
                    <p className="text-2xl font-bold">{marketIndex.value.toFixed(1)}</p>
                </div>
                <div className={`flex items-center gap-1 ${marketIndex.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    <TrendingUp className={`h-5 w-5 ${marketIndex.change < 0 ? 'rotate-180' : ''}`} />
                    <div className="text-right">
                        <p className="text-sm font-semibold">
                            {marketIndex.change >= 0 ? '+' : ''}{marketIndex.change.toFixed(2)}
                        </p>
                        <p className="text-xs">
                            ({marketIndex.change >= 0 ? '+' : ''}{marketIndex.changePercent.toFixed(2)}%)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
