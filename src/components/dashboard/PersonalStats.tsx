'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Stats {
    totalTransactions: number;
    totalVolumeUsd: number;
    successRate: number;
    portfolioValue: number;
    portfolioChange: number;
    activeWatchlists: number;
    activeAlerts: number;
}

export function PersonalStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('bearer_token');

                // Fetch transactions
                const txResponse = await fetch('/api/transactions', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                let totalTransactions = 0;
                let totalVolumeUsd = 0;
                let successRate = 100;

                if (txResponse.ok) {
                    const txData = await txResponse.json();
                    const transactions = txData.transactions || [];
                    totalTransactions = transactions.length;

                    // Calculate total volume
                    totalVolumeUsd = transactions.reduce((sum: number, tx: any) => {
                        return sum + (tx.amountOut || 0);
                    }, 0);

                    // Calculate success rate
                    const confirmedTx = transactions.filter((tx: any) => tx.status === 'confirmed').length;
                    successRate = totalTransactions > 0 ? (confirmedTx / totalTransactions) * 100 : 100;
                }

                // Fetch portfolio
                const portfolioResponse = await fetch('/api/portfolios', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                let portfolioValue = 0;
                let portfolioChange = 0;

                if (portfolioResponse.ok) {
                    const portfolioData = await portfolioResponse.json();
                    if (portfolioData.portfolio) {
                        portfolioValue = portfolioData.portfolio.totalValueUsd || 0;
                        // Mock portfolio change (you can calculate this based on historical data)
                        portfolioChange = Math.random() * 20 - 10;
                    }
                }

                // Fetch watchlists and alerts
                const [watchlistsRes, alertsRes] = await Promise.all([
                    fetch('/api/watchlists', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('/api/price-alerts', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                let activeWatchlists = 0;
                let activeAlerts = 0;

                if (watchlistsRes.ok) {
                    const watchlistsData = await watchlistsRes.json();
                    activeWatchlists = (watchlistsData.watchlists || []).length;
                }

                if (alertsRes.ok) {
                    const alertsData = await alertsRes.json();
                    activeAlerts = (alertsData.alerts || []).filter((a: any) => !a.triggered).length;
                }

                setStats({
                    totalTransactions,
                    totalVolumeUsd,
                    successRate,
                    portfolioValue,
                    portfolioChange,
                    activeWatchlists,
                    activeAlerts,
                });
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm text-muted-foreground">Loading statistics...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Portfolio Value */}
                    <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Portfolio Value</p>
                            <DollarSign className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold">
                            ${stats?.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            {(stats?.portfolioChange || 0) >= 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-green-500">
                                        +{stats?.portfolioChange.toFixed(2)}%
                                    </span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                    <span className="text-xs text-red-500">
                                        {stats?.portfolioChange.toFixed(2)}%
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Total Volume */}
                    <div className="p-4 rounded-lg border bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Total Volume</p>
                            <Activity className="h-4 w-4 text-cyan-500" />
                        </div>
                        <p className="text-2xl font-bold">
                            ${stats?.totalVolumeUsd.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.totalTransactions || 0} transactions
                        </p>
                    </div>

                    {/* Success Rate */}
                    <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                        <p className="text-2xl font-bold">{stats?.successRate.toFixed(1)}%</p>
                        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                style={{ width: `${stats?.successRate || 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Active Items */}
                    <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">Active Items</p>
                        <p className="text-2xl font-bold">
                            {(stats?.activeWatchlists || 0) + (stats?.activeAlerts || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.activeWatchlists || 0} watchlists • {stats?.activeAlerts || 0} alerts
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
