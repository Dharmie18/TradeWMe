'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface ConnectedWallet {
  id: string;
  address: string;
  chain: string;
  walletType: string;
  initialBalance: number;
  connectedAt: string;
}

export function WalletConnection() {
  const [wallets, setWallets] = useState<ConnectedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement wallet fetch API
      // For now, check localStorage
      const connectedWallet = localStorage.getItem('connectedWallet');
      if (connectedWallet) {
        setWallets([JSON.parse(connectedWallet)]);
      }
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (walletType: 'metamask' | 'walletconnect' | 'coinbase') => {
    setIsConnecting(true);
    setError('');

    try {
      // Check if MetaMask is installed
      if (walletType === 'metamask' && !window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const address = accounts[0];

      // Get chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Map chain ID to chain name
      const chainMap: Record<string, string> = {
        '0x1': 'ethereum',
        '0x38': 'bsc',
        '0x89': 'polygon',
        '0xaa36a7': 'ethereum-testnet', // Sepolia
      };

      const chain = chainMap[chainId] || 'ethereum';

      // Connect wallet via API
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          address,
          chain,
          walletType,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to connect wallet');
      }

      // Save to localStorage
      localStorage.setItem('connectedWallet', JSON.stringify(data.wallet));
      
      // Update state
      setWallets([data.wallet]);

      // Show success message
      alert('Wallet connected successfully! Balance is 0 until you make a deposit.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (address: string, chain: string) => {
    const explorers: Record<string, string> = {
      ethereum: `https://etherscan.io/address/${address}`,
      'ethereum-testnet': `https://sepolia.etherscan.io/address/${address}`,
      bsc: `https://bscscan.com/address/${address}`,
      polygon: `https://polygonscan.com/address/${address}`,
    };
    return explorers[chain] || '#';
  };

  const getChainBadge = (chain: string) => {
    const config: Record<string, { name: string; color: string }> = {
      ethereum: { name: 'Ethereum', color: 'bg-blue-500' },
      'ethereum-testnet': { name: 'Sepolia', color: 'bg-purple-500' },
      bsc: { name: 'BSC', color: 'bg-yellow-500' },
      polygon: { name: 'Polygon', color: 'bg-purple-600' },
    };
    const cfg = config[chain] || { name: chain, color: 'bg-gray-500' };
    return (
      <Badge variant="secondary" className="capitalize">
        <span className={`w-2 h-2 rounded-full ${cfg.color} mr-2`} />
        {cfg.name}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your wallet to start trading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {wallets.length > 0 ? (
          // Connected Wallet Display
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="border rounded-lg p-4 space-y-3"
              >
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Connected</span>
                  </div>
                  {getChainBadge(wallet.chain)}
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                      {wallet.address}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(wallet.address, wallet.id)}
                    >
                      {copied === wallet.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Wallet Type */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Wallet Type</span>
                  <span className="font-medium capitalize">{wallet.walletType}</span>
                </div>

                {/* Initial Balance Notice */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Balance: {wallet.initialBalance}</strong> - Your balance is 0 until you make a deposit.
                  </AlertDescription>
                </Alert>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(getExplorerUrl(wallet.address, wallet.chain), '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Connect Wallet Buttons
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Connect your wallet to deposit funds and start trading. Your balance will be 0 until you make a deposit.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => connectWallet('metamask')}
                disabled={isConnecting}
                className="w-full"
                variant="outline"
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                    alt="MetaMask"
                    className="mr-2 h-5 w-5"
                  />
                )}
                Connect MetaMask
              </Button>

              <Button
                onClick={() => connectWallet('walletconnect')}
                disabled={isConnecting}
                className="w-full"
                variant="outline"
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                WalletConnect
              </Button>

              <Button
                onClick={() => connectWallet('coinbase')}
                disabled={isConnecting}
                className="w-full"
                variant="outline"
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Coinbase Wallet
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By connecting your wallet, you agree to our Terms of Service
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
