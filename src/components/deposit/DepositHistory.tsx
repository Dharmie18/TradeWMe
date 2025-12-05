'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Deposit {
  id: string;
  txHash: string;
  amount: string;
  currency: string;
  chain: string;
  amountUsd: number;
  status: string;
  confirmations: number;
  requiredConfirmations: number;
  createdAt: string;
  confirmedAt?: string;
}

export function DepositHistory() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDeposits = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/deposits?limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch deposits');
      }

      setDeposits(data.deposits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deposits');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDeposits(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      CONFIRMED: { variant: 'default', icon: CheckCircle2 },
      CONFIRMING: { variant: 'secondary', icon: Clock },
      PENDING: { variant: 'outline', icon: Clock },
      FAILED: { variant: 'destructive', icon: XCircle },
      REJECTED: { variant: 'destructive', icon: XCircle },
    };

    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getExplorerUrl = (txHash: string, chain: string) => {
    const explorers: Record<string, string> = {
      ethereum: `https://etherscan.io/tx/${txHash}`,
      'ethereum-testnet': `https://sepolia.etherscan.io/tx/${txHash}`,
      bsc: `https://bscscan.com/tx/${txHash}`,
      polygon: `https://polygonscan.com/tx/${txHash}`,
    };
    return explorers[chain] || '#';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Loading Deposits...</p>
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
          <Button onClick={() => fetchDeposits()} className="mt-4 w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Deposits Yet</p>
            <p className="text-sm mt-2">Your deposit history will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deposit History</CardTitle>
            <CardDescription>
              View all your past deposits
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">
                      {deposit.amount} {deposit.currency}
                    </span>
                    {getStatusBadge(deposit.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ${deposit.amountUsd.toFixed(2)} USD
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(getExplorerUrl(deposit.txHash, deposit.chain), '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Network</p>
                  <p className="font-medium capitalize">{deposit.chain}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(deposit.createdAt)}</p>
                </div>
                {deposit.status !== 'CONFIRMED' && deposit.status !== 'FAILED' && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Confirmations</p>
                    <p className="font-medium">
                      {deposit.confirmations} / {deposit.requiredConfirmations}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">Transaction Hash</p>
                <p className="font-mono text-xs break-all mt-1">
                  {deposit.txHash}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
