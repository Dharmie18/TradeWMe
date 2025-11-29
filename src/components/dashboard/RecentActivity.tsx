'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: string;
    action: string;
    amount: number;
    timestamp: Date;
    status: 'success' | 'pending' | 'failed';
}

/**
 * RecentActivity component displays recent user trading/financial activities
 * Shows transaction history with amounts and status
 */
export function RecentActivity() {
    // Mock data - in production, fetch from API
    const activities: ActivityItem[] = [
        {
            id: '1',
            type: 'deposit',
            action: 'Deposited funds',
            amount: 5000,
            timestamp: new Date(Date.now() - 3600000),
            status: 'success',
        },
        {
            id: '2',
            type: 'trade',
            action: 'Buy BTC',
            amount: -2000,
            timestamp: new Date(Date.now() - 7200000),
            status: 'success',
        },
        {
            id: '3',
            type: 'profit',
            action: 'Trading profit',
            amount: 1500,
            timestamp: new Date(Date.now() - 14400000),
            status: 'success',
        },
    ];

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${activity.amount > 0
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {activity.amount > 0 ? (
                                        <TrendingUp className="h-4 w-4" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">{activity.action}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {getTimeAgo(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                            <div className={`font-semibold ${activity.amount > 0
                                    ? 'text-emerald-500'
                                    : 'text-foreground'
                                }`}>
                                {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
