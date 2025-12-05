'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';

interface Price {
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  timestamp: string;
}

export function RealTimePrices() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to SSE endpoint
    const eventSource = new EventSource('/api/prices/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Price stream connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPrices(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to parse price data:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.error('Price stream error');
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getCryptoIcon = (symbol: string) => {
    const icons: Record<string, string> = {
      BTC: '₿',
      ETH: '⟠',
      SOL: '◎',
      BNB: '🔶',
      MATIC: '🟣',
    };
    return icons[symbol] || '●';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Market Prices
            </CardTitle>
            <CardDescription>
              Real-time cryptocurrency prices
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              {isConnected ? 'Live' : 'Connecting...'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading prices...</p>
            </div>
          ) : (
            prices.map((price) => (
              <div
                key={price.symbol}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getCryptoIcon(price.symbol)}
                  </div>
                  <div>
                    <p className="font-semibold">{price.symbol}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {price.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    {formatPrice(price.priceUsd)}
                  </p>
                  <div className={`flex items-center gap-1 text-sm ${
                    price.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {price.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{formatChange(price.change24h)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {lastUpdate && (
          <p className="text-xs text-center text-muted-foreground mt-4">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
