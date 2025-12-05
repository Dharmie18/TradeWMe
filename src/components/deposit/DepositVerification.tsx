'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  ArrowLeft,
  AlertCircle 
} from 'lucide-react';

interface DepositVerificationProps {
  txHash: string;
  chain: string;
  expectedAmount?: string;
  onBack: () => void;
}

type DepositStatus = 'PENDING' | 'CONFIRMING' | 'CONFIRMED' | 'FAILED' | 'REJECTED';

export function DepositVerification({ 
  txHash, 
  chain, 
  expectedAmount,
  onBack 
}: DepositVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [deposit, setDeposit] = useState<any>(null);
  const [error, setError] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  const verifyDeposit = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/deposit/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          txHash,
          chain,
          expectedAmount,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Verification failed');
      }

      setDeposit(data.deposit);

      // Start polling if not confirmed
      if (data.deposit.status !== 'CONFIRMED' && data.deposit.status !== 'FAILED') {
        setIsPolling(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/deposit/verify?txHash=${txHash}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success && data.deposit) {
        setDeposit(data.deposit);

        // Stop polling if confirmed or failed
        if (data.deposit.status === 'CONFIRMED' || data.deposit.status === 'FAILED') {
          setIsPolling(false);
        }
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  };

  useEffect(() => {
    verifyDeposit();
  }, []);

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isPolling]);

  const getExplorerUrl = (hash: string) => {
    const explorers: Record<string, string> = {
      ethereum: `https://etherscan.io/tx/${hash}`,
      'ethereum-testnet': `https://sepolia.etherscan.io/tx/${hash}`,
      bsc: `https://bscscan.com/tx/${hash}`,
      polygon: `https://polygonscan.com/tx/${hash}`,
    };
    return explorers[chain] || '#';
  };

  const getStatusIcon = (status: DepositStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle2 className="h-12 w-12 text-green-500" />;
      case 'FAILED':
      case 'REJECTED':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case 'CONFIRMING':
        return <Clock className="h-12 w-12 text-blue-500 animate-pulse" />;
      default:
        return <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusMessage = (status: DepositStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Deposit Confirmed!';
      case 'FAILED':
        return 'Transaction Failed';
      case 'REJECTED':
        return 'Deposit Rejected';
      case 'CONFIRMING':
        return 'Confirming Transaction...';
      default:
        return 'Pending Confirmation...';
    }
  };

  const confirmationProgress = deposit 
    ? (deposit.confirmations / deposit.requiredConfirmations) * 100
    : 0;

  if (isVerifying) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Verifying Transaction...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Checking blockchain for your deposit
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Verification Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={onBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Verification</CardTitle>
        <CardDescription>
          Transaction status and confirmation progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Icon */}
        <div className="flex flex-col items-center justify-center py-6">
          {getStatusIcon(deposit.status)}
          <h3 className="text-xl font-bold mt-4">{getStatusMessage(deposit.status)}</h3>
          {deposit.status === 'CONFIRMED' && (
            <p className="text-sm text-muted-foreground mt-2">
              Your balance has been updated
            </p>
          )}
        </div>

        {/* Deposit Details */}
        <div className="space-y-3 bg-muted p-4 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-medium">
              {deposit.amount} {deposit.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">USD Value</span>
            <span className="font-medium">${deposit.amountUsd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            <span className="font-medium capitalize">{deposit.chain}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`font-medium ${
              deposit.status === 'CONFIRMED' ? 'text-green-500' :
              deposit.status === 'FAILED' ? 'text-red-500' :
              'text-blue-500'
            }`}>
              {deposit.status}
            </span>
          </div>
        </div>

        {/* Confirmation Progress */}
        {deposit.status !== 'CONFIRMED' && deposit.status !== 'FAILED' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confirmations</span>
              <span className="font-medium">
                {deposit.confirmations} / {deposit.requiredConfirmations}
              </span>
            </div>
            <Progress value={confirmationProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {isPolling && 'Checking for updates every 10 seconds...'}
            </p>
          </div>
        )}

        {/* Transaction Hash */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction Hash</label>
          <div className="bg-muted px-3 py-2 rounded-md font-mono text-xs break-all">
            {deposit.txHash}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(getExplorerUrl(deposit.txHash), '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Deposit
          </Button>
        </div>

        {/* Success Message */}
        {deposit.status === 'CONFIRMED' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your deposit has been confirmed and credited to your account.
              You can now start trading!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
