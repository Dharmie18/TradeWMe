'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface QRCodeDisplayProps {
  qrCode: {
    uri: string;
    imageUrl: string;
    address: string;
    amount?: string;
    currency?: string;
  };
  chain: string;
  amount: string;
  currency: string;
}

export function QRCodeDisplay({ qrCode, chain, amount, currency }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getExplorerUrl = (address: string) => {
    const explorers: Record<string, string> = {
      ethereum: `https://etherscan.io/address/${address}`,
      bsc: `https://bscscan.com/address/${address}`,
      polygon: `https://polygonscan.com/address/${address}`,
    };
    return explorers[chain] || '#';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan QR Code</CardTitle>
        <CardDescription>
          Scan with your wallet app or copy address below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Image */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg">
            <Image
              src={qrCode.imageUrl}
              alt="Deposit QR Code"
              width={300}
              height={300}
              className="rounded"
            />
          </div>
        </div>

        {/* Deposit Amount */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Deposit Amount</p>
          <p className="text-2xl font-bold">
            {amount} {currency}
          </p>
        </div>

        {/* Deposit Address */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Deposit Address</Label>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted px-3 py-2 rounded-md font-mono text-sm break-all">
              {qrCode.address}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(qrCode.address)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* EIP-681 URI (for wallet apps) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Payment URI</Label>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted px-3 py-2 rounded-md font-mono text-xs break-all">
              {qrCode.uri}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(qrCode.uri)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            EIP-681 compliant URI for wallet apps
          </p>
        </div>

        {/* View on Explorer */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(getExplorerUrl(qrCode.address), '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Address on Explorer
        </Button>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p><strong>How to deposit:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Scan QR code with your wallet app</li>
              <li>Or copy the address and paste in your wallet</li>
              <li>Send exactly {amount} {currency}</li>
              <li>Wait for blockchain confirmation</li>
              <li>Your balance will update automatically</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Warning */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>⚠️ Important:</strong> Only send {currency} on {chain} network.
            Sending other tokens or using wrong network will result in permanent loss of funds.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
