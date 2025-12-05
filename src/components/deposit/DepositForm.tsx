'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRCodeDisplay } from './QRCodeDisplay';
import { DepositVerification } from './DepositVerification';
import { Loader2, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

type Chain = 'ethereum' | 'bsc' | 'polygon';
type Currency = 'ETH' | 'BNB' | 'MATIC';

const CHAIN_CONFIG = {
  ethereum: {
    name: 'Ethereum',
    currency: 'ETH' as Currency,
    icon: '⟠',
    minDeposit: 0.001,
  },
  bsc: {
    name: 'Binance Smart Chain',
    currency: 'BNB' as Currency,
    icon: '🔶',
    minDeposit: 0.01,
  },
  polygon: {
    name: 'Polygon',
    currency: 'MATIC' as Currency,
    icon: '🟣',
    minDeposit: 1,
  },
};

export function DepositForm() {
  const [chain, setChain] = useState<Chain>('ethereum');
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const platformAddress = process.env.NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS || '';
  const config = CHAIN_CONFIG[chain];

  const handleGenerateQR = async () => {
    setError('');
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum < config.minDeposit) {
      setError(`Minimum deposit is ${config.minDeposit} ${config.currency}`);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          address: platformAddress,
          chain,
          amount,
          currency: config.currency,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate QR code');
      }

      setQrCode(data.qrCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyDeposit = () => {
    if (!txHash.trim()) {
      setError('Please enter a transaction hash');
      return;
    }
    setShowVerification(true);
  };

  if (showVerification) {
    return (
      <DepositVerification
        txHash={txHash}
        chain={chain}
        expectedAmount={amount}
        onBack={() => {
          setShowVerification(false);
          setTxHash('');
        }}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column - Deposit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit Details</CardTitle>
          <CardDescription>
            Select network and amount to deposit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chain Selection */}
          <div className="space-y-2">
            <Label htmlFor="chain">Network</Label>
            <Select value={chain} onValueChange={(value) => setChain(value as Chain)}>
              <SelectTrigger id="chain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHAIN_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{cfg.icon}</span>
                      <span>{cfg.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Minimum deposit: {config.minDeposit} {config.currency}
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({config.currency})</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              min={config.minDeposit}
              placeholder={`Min: ${config.minDeposit}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Generate QR Button */}
          <Button
            onClick={handleGenerateQR}
            disabled={isGenerating || !amount}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Generate Deposit QR Code
              </>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Important:</strong> Only send {config.currency} on {config.name} network.
              Sending other tokens or using wrong network will result in loss of funds.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Right Column - QR Code Display */}
      {qrCode ? (
        <QRCodeDisplay
          qrCode={qrCode}
          chain={chain}
          amount={amount}
          currency={config.currency}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Deposit Address</CardTitle>
            <CardDescription>
              Generate QR code to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-muted-foreground">
              <Wallet className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Enter amount and generate QR code</p>
              <p className="text-sm mt-2">to see deposit address</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Verification Section */}
      {qrCode && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Already Sent Transaction?</CardTitle>
            <CardDescription>
              Enter your transaction hash to verify and track your deposit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="0x... (Transaction Hash)"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                />
              </div>
              <Button onClick={handleVerifyDeposit} disabled={!txHash.trim()}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify Deposit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
