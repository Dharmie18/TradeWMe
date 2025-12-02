'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Loader2, Info, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Transaction {
    id: number;
    txHash: string;
    type: string;
    tokenIn: string | null;
    tokenOut: string | null;
    amountIn: number | null;
    amountOut: number | null;
    status: string;
    timestamp: string;
}

export function RecentActivity() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('bearer_token');
                const response = await fetch('/api/transactions?limit=5', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch transactions');
                }

                const data = await response.json();
                setTransactions(data.transactions || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load activity');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'swap':
                return <RefreshCw className="h-4 w-4" />;
            case 'receive':
                return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
            case 'send':
                return <ArrowUpRight className="h-4 w-4 text-red-500" />;
            default:
                return <RefreshCw className="h-4 w-4" />;
        }
    };

    const getDescription = (tx: Transaction) => {
        switch (tx.type) {
            case 'swap':
                return `Swapped ${tx.tokenIn || 'N/A'} to ${tx.tokenOut || 'N/A'}`;
            case 'receive':
                return `Received ${tx.tokenOut || 'N/A'}`;
            case 'send':
                return `Sent ${tx.tokenIn || 'N/A'}`;
            default:
                return 'Transaction';
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            confirmed: 'default',
            pending: 'secondary',
            failed: 'destructive',
        };
        return (
            <Badge variant={variants[status] || 'secondary'} className="capitalize">
                {status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm text-muted-foreground">Loading activity...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md mb-4">
                            Start trading to see your recent activity here!
                        </p>
                        <Link href="/trade">
                            <Button>Start Trading</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Recent Activity</CardTitle>
                    <Link href="/portfolio">
                        <Button variant="ghost" size="sm">
                            View All
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                                    {getIcon(tx.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{getDescription(tx)}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(tx.timestamp), 'MMM dd, HH:mm')}
                                        </p>
                                        <a
                                            href={`https://etherscan.io/tx/${tx.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline flex items-center gap-1 font-mono"
                                        >
                                            {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="ml-2">
                                {getStatusBadge(tx.status)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
