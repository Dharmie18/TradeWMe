'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Bell, TrendingUp, Loader2, Plus, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Watchlist {
  id: number;
  name: string;
  tokens: string[];
  createdAt: string;
}

interface PriceAlert {
  id: number;
  tokenSymbol: string;
  condition: string;
  targetPrice: number;
  triggered: boolean;
  createdAt: string;
}

export function SavedItems() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('bearer_token');

        const [watchlistsRes, alertsRes] = await Promise.all([
          fetch('/api/watchlists', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/price-alerts', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (watchlistsRes.ok) {
          const watchlistsData = await watchlistsRes.json();
          setWatchlists(watchlistsData.watchlists || []);
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.alerts || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved items');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading saved items...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalItems = watchlists.length + alerts.length;
  const activeAlerts = alerts.filter(a => !a.triggered).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Saved Items</CardTitle>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Items</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Create watchlists and price alerts to track your favorite tokens
            </p>
            <Link href="/tools">
              <Button>Go to Tools</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Watchlists Section */}
            {watchlists.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Watchlists
                  </h3>
                  <Badge variant="secondary">{watchlists.length}</Badge>
                </div>
                <div className="space-y-2">
                  {watchlists.slice(0, 3).map((watchlist) => (
                    <Link key={watchlist.id} href="/tools">
                      <div className="p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{watchlist.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {Array.isArray(watchlist.tokens) ? watchlist.tokens.length : 0} tokens
                            </p>
                          </div>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {watchlists.length > 3 && (
                    <Link href="/tools">
                      <Button variant="ghost" size="sm" className="w-full">
                        View {watchlists.length - 3} more
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Price Alerts Section */}
            {alerts.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    Price Alerts
                  </h3>
                  <Badge variant="secondary">{activeAlerts} active</Badge>
                </div>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <Link key={alert.id} href="/tools">
                      <div className="p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{alert.tokenSymbol}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {alert.condition === 'above' ? '↑' : '↓'} ${alert.targetPrice.toFixed(2)}
                            </p>
                          </div>
                          {alert.triggered ? (
                            <Badge variant="default" className="text-xs">Triggered</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Active</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {alerts.length > 3 && (
                    <Link href="/tools">
                      <Button variant="ghost" size="sm" className="w-full">
                        View {alerts.length - 3} more
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
