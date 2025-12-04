'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

interface Trade {
  id: number;
  txHash: string;
  type: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  timestamp: string;
  status: string;
}

export function RecentTrades() {
  const { data: session } = useSession();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrades = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${session.user.id}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTrades(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();

    // Real-time updates every 15 seconds
    const interval = setInterval(fetchTrades, 15000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchTrades}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : trades.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.slice(0, 5).map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    trade.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {trade.type === 'buy' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {trade.tokenIn} → {trade.tokenOut}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {trade.amountOut.toFixed(4)} {trade.tokenOut}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {trade.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}