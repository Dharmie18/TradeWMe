'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Balance {
  currency: string;
  balance: string;
  lockedBalance: string;
  availableBalance: string;
  balanceUsd: number;
  totalDeposited: string;
  totalWithdrawn: string;
  totalProfits: string;
  lastUpdated: string;
}

interface BalanceSummary {
  totalBalanceUsd: number;
  totalDeposited: number;
  totalProfits: number;
  profitPercentage: string;
}

export function BalanceDisplay() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [hideBalances, setHideBalances] = useState(false);

  const fetchBalances = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch balances');
      }

      setBalances(data.balances);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBalances(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBalances(false);
  };

  const formatBalance = (balance: string) => {
    if (hideBalances) return '••••••';
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.01) return num.toFixed(8);
    return num.toFixed(4);
  };

  const formatUsd = (amount: number) => {
    if (hideBalances) return '••••••';
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCurrencyIcon = (currency: string) => {
    const icons: Record<string, string> = {
      ETH: '⟠',
      BTC: '₿',
      BNB: '🔶',
      MATIC: '🟣',
      SOL: '◎',
      USDT: '₮',
      USDC: '$',
    };
    return icons[currency] || '●';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading balances...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => fetchBalances()} className="mt-4 w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const profitIsPositive = summary && parseFloat(summary.profitPercentage) >= 0;

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Total Balance</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHideBalances(!hideBalances)}
              >
                {hideBalances ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Balance */}
          <div>
            <p className="text-4xl font-bold">
              {summary ? formatUsd(summary.totalBalanceUsd) : '$0.00'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total Portfolio Value
            </p>
          </div>

          {/* Profit/Loss */}
          {summary && summary.totalProfits > 0 && (
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-xl font-semibold text-green-500">
                  {formatUsd(summary.totalProfits)}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Profit %</p>
                <div className="flex items-center gap-1">
                  {profitIsPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <p className={`text-xl font-semibold ${
                    profitIsPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {hideBalances ? '••••' : `${summary.profitPercentage}%`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link href="/deposit" className="flex-1">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Deposit
              </Button>
            </Link>
            <Link href="/trade" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Trade
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Individual Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>
            Your cryptocurrency holdings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No Assets Yet</p>
              <p className="text-sm mt-1">Make a deposit to get started</p>
              <Link href="/deposit">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Make Deposit
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {balances.map((balance) => (
                <div
                  key={balance.currency}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getCurrencyIcon(balance.currency)}
                    </div>
                    <div>
                      <p className="font-semibold">{balance.currency}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatBalance(balance.availableBalance)} available
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatBalance(balance.balance)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatUsd(balance.balanceUsd)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance is 0 Alert */}
      {balances.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Getting Started:</strong> Your balance is 0 until you make a deposit.
            Connect your wallet and deposit cryptocurrency to start trading.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
