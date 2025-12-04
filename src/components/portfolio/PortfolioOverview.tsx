 'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet, Activity, DollarSign } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';

export function PortfolioOverview() {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading } = useBalance({
    address,
  });

  const formattedBalance = balance
    ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
    : '$0.00';

  const portfolioStats = [
    {
      label: 'Total Balance',
      value: isLoading ? 'Loading...' : formattedBalance,
      change: isConnected ? 'Live' : 'Connect Wallet',
      isPositive: true,
      icon: Wallet,
    },
    {
      label: '24h P&L',
      value: isConnected ? '$0.00' : '—',
      change: isConnected ? '0.0%' : '',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      label: 'Total Invested',
      value: isConnected ? '$0.00' : '—',
      change: '',
      isPositive: true,
      icon: DollarSign,
    },
    {
      label: 'Active Positions',
      value: isConnected ? '0' : '—',
      change: '',
      isPositive: true,
      icon: Activity,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {portfolioStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p
                  className={`text-xs ${stat.isPositive ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                  {stat.change}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

