'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, Activity, Target } from 'lucide-react';

/**
 * PersonalStats component displays quick overview statistics
 * Shows portfolio performance metrics
 */
export function PersonalStats() {
    // Mock data - in production, fetch from API
    const stats = [
        {
            label: 'Total Portfolio Value',
            value: '$92,000',
            change: '+15.3%',
            isPositive: true,
            icon: DollarSign,
        },
        {
            label: 'Active Trades',
            value: '12',
            change: '+3 today',
            isPositive: true,
            icon: Activity,
        },
        {
            label: 'Monthly Return',
            value: '+24.5%',
            change: 'vs last month',
            isPositive: true,
            icon: TrendingUp,
        },
        {
            label: 'Success Rate',
            value: '87%',
            change: 'avg. 85%',
            isPositive: true,
            icon: Target,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </p>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className={`text-xs ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                {stat.change}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
