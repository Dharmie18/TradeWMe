'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Bell, Plus, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Watchlist {
  id: number;
  name: string;
  tokens: Array<{
    symbol: string;
    address: string;
    price?: number;
    change24h?: number;
  }>;
  createdAt: string;
}

interface PriceAlert {
  id: number;
  tokenSymbol: string;
  tokenAddress: string;
  condition: string;
  targetPrice: number;
  currentPrice?: number;
  triggered: boolean;
  createdAt: string;
}

/**
 * SavedItems component displays user's watchlists and price alerts
 * Organized in tabs for easy navigation
 */
export function SavedItems() {
  const { data: session } = useSession();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedItems = async () => {
    if (!session?.user) return;

    try {
      const token = localStorage.getItem('bearer_token');

      // Fetch watchlists
      const watchlistsResponse = await fetch('/api/watchlists', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fetch price alerts
      const alertsResponse = await fetch('/api/price-alerts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (watchlistsResponse.ok) {
        const watchlistsData = await watchlistsResponse.json();
        setWatchlists(watchlistsData.watchlists || []);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
      toast.error('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchSavedItems();
    }
  }, [session]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Saved Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Saved Items
        </CardTitle>
        <CardDescription>
          Your watchlists and price alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="watchlists" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="watchlists" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Watchlists ({watchlists.length})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alerts ({alerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlists" className="space-y-4">
            {watchlists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No watchlists yet</p>
                <p className="text-sm">Create a watchlist to track your favorite tokens</p>
                <Button variant="outline" size="sm" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Watchlist
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlists.map((watchlist) => (
                  <div key={watchlist.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{watchlist.name}</h4>
                      <Badge variant="outline">{watchlist.tokens.length} tokens</Badge>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {watchlist.tokens.slice(0, 6).map((token, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{token.symbol}</span>
                          <div className="flex items-center gap-1">
                            {token.change24h !== undefined && (
                              <>
                                {token.change24h >= 0 ? (
                                  <TrendingUp className="h-3 w-3 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={`text-xs ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {token.change24h.toFixed(2)}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {watchlist.tokens.length > 6 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        +{watchlist.tokens.length - 6} more tokens
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No price alerts set</p>
                <p className="text-sm">Set alerts to get notified when prices hit your targets</p>
                <Button variant="outline" size="sm" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Alert
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.tokenSymbol}</span>
                          {alert.triggered && <Badge variant="default">Triggered</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.condition} ${alert.targetPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created {format(new Date(alert.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Target: ${alert.targetPrice.toFixed(2)}
                      </div>
                      {alert.currentPrice && (
                        <div className="text-xs text-muted-foreground">
                          Current: ${alert.currentPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
