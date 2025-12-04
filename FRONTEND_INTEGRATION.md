# Frontend Integration Guide

## Complete React Components for Trading Platform

### 1. Wallet Connection Component

```typescript
'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState } from 'react';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState(false);

  const handleConnect = async (connector: any) => {
    try {
      setLoading(true);
      
      // Connect wallet
      connect({ connector });
      
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Register with backend
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`, // Get from session
        },
        body: JSON.stringify({
          walletAddress: address,
          walletType: connector.name.toLowerCase(),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="p-4 border rounded">
        <p className="text-sm text-gray-600">Connected Wallet</p>
        <p className="font-mono text-sm">{address}</p>
        <button 
          onClick={() => disconnect()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Connect Wallet</h3>
      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => handleConnect(connector)}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {connector.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 2. Deposit Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

const PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS!;

export function DepositForm() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'ETH' | 'USDT'>('ETH');
  const [status, setStatus] = useState('');
  
  const { data: hash, sendTransaction } = useSendTransaction();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleDeposit = async () => {
    if (!address || !amount) {
      alert('Please enter an amount');
      return;
    }

    try {
      setStatus('Sending transaction...');
      
      // Send transaction
      sendTransaction({
        to: PLATFORM_ADDRESS,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Error sending transaction:', error);
      setStatus('Error sending transaction');
    }
  };

  // Submit to backend after transaction is sent
  useEffect(() => {
    if (hash) {
      submitDeposit(hash);
    }
  }, [hash]);

  const submitDeposit = async (txHash: string) => {
    setStatus('Submitting deposit...');
    
    const response = await fetch('/api/deposits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
      },
      body: JSON.stringify({
        txHash,
        fromAddress: address,
        amount,
        currency,
        network: 'ethereum',
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      setStatus('Deposit submitted! Waiting for confirmations...');
      pollDepositStatus(txHash);
    } else {
      setStatus(`Error: ${data.message}`);
    }
  };

  const pollDepositStatus = async (txHash: string) => {
    const interval = setInterval(async () => {
      const response = await fetch(
        `/api/deposits/status?txHash=${txHash}`,
        {
          headers: {
            'Authorization': `Bearer ${userId}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.deposit) {
        setStatus(`Confirmations: ${data.deposit.confirmations}`);
        
        if (data.deposit.status === 'confirmed') {
          clearInterval(interval);
          setStatus('Deposit confirmed! Balance updated.');
          setAmount('');
        }
      }
    }, 10000); // Check every 10 seconds
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Deposit Funds</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2 border rounded"
            step="0.001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as any)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
          </select>
        </div>

        <button 
          onClick={handleDeposit} 
          disabled={isLoading || !address}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Deposit'}
        </button>

        {status && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm">{status}</p>
          </div>
        )}

        {hash && (
          <div className="p-3 bg-gray-50 border rounded">
            <p className="text-xs font-mono break-all">
              Transaction: {hash}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Balance Display Component

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Balance {
  currency: string;
  balance: string;
  lockedBalance: string;
  availableBalance: string;
  totalDeposited: string;
  totalProfits: string;
  balanceUsd: number;
}

export function BalanceDisplay() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [totalUsd, setTotalUsd] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBalances = async () => {
    try {
      const response = await fetch('/api/balance', {
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setBalances(data.balances);
        setTotalUsd(data.totalBalanceUsd);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading balances...</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Your Balances</h3>
      
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <p className="text-sm text-gray-600">Total Balance</p>
        <p className="text-2xl font-bold">${totalUsd.toFixed(2)} USD</p>
      </div>
      
      <div className="space-y-3">
        {balances.map((balance) => (
          <div key={balance.currency} className="p-3 border rounded">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold">{balance.currency}</h4>
              <span className="text-sm text-gray-600">
                ${balance.balanceUsd.toFixed(2)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Balance</p>
                <p className="font-mono">{parseFloat(balance.balance).toFixed(6)}</p>
              </div>
              <div>
                <p className="text-gray-600">Available</p>
                <p className="font-mono">{parseFloat(balance.availableBalance).toFixed(6)}</p>
              </div>
              <div>
                <p className="text-gray-600">Deposited</p>
                <p className="font-mono">{parseFloat(balance.totalDeposited).toFixed(6)}</p>
              </div>
              <div>
                <p className="text-gray-600">Profits</p>
                <p className="font-mono text-green-600">
                  +{parseFloat(balance.totalProfits).toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {balances.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No balances yet. Make your first deposit!
        </p>
      )}
    </div>
  );
}
```

### 4. Dashboard Component

```typescript
'use client';

import { useEffect, useState } from 'react';

export function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  if (!summary) {
    return <div className="p-4">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded bg-blue-50">
          <p className="text-sm text-gray-600">Total Balance</p>
          <p className="text-2xl font-bold">
            ${summary.totalBalanceUsd.toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 border rounded bg-green-50">
          <p className="text-sm text-gray-600">Total Deposits</p>
          <p className="text-2xl font-bold">
            ${summary.totalDepositsUsd.toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 border rounded bg-purple-50">
          <p className="text-sm text-gray-600">Total Profits</p>
          <p className="text-2xl font-bold text-green-600">
            +${summary.totalProfitsUsd.toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 border rounded bg-yellow-50">
          <p className="text-sm text-gray-600">Profit %</p>
          <p className="text-2xl font-bold text-green-600">
            +{summary.profitPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Connected Wallet */}
      {summary.connectedWallet && (
        <div className="p-4 border rounded">
          <h3 className="font-bold mb-2">Connected Wallet</h3>
          <p className="font-mono text-sm">{summary.connectedWallet.address}</p>
          <p className="text-sm text-gray-600 capitalize">
            {summary.connectedWallet.type}
          </p>
        </div>
      )}

      {/* Recent Deposits */}
      <div className="p-4 border rounded">
        <h3 className="font-bold mb-4">Recent Deposits</h3>
        {summary.recentDeposits.length > 0 ? (
          <div className="space-y-2">
            {summary.recentDeposits.map((deposit: any) => (
              <div key={deposit.txHash} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">
                      {deposit.amount} {deposit.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${deposit.amountUsd.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(deposit.depositedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-mono text-gray-400">
                      {deposit.txHash.slice(0, 10)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No deposits yet</p>
        )}
      </div>

      {/* Recent Profits */}
      <div className="p-4 border rounded">
        <h3 className="font-bold mb-4">Recent Profits</h3>
        {summary.recentProfits.length > 0 ? (
          <div className="space-y-2">
            {summary.recentProfits.map((profit: any, i: number) => (
              <div key={i} className="p-3 bg-green-50 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-green-600">
                      +{profit.amount} {profit.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${profit.amountUsd.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs capitalize">{profit.profitType}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(profit.calculatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No profits yet</p>
        )}
      </div>
    </div>
  );
}
```

### 5. Profit Calculator Component

```typescript
'use client';

import { useState } from 'react';

export function ProfitCalculator() {
  const [profitType, setProfitType] = useState<'daily' | 'trading'>('daily');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculateProfits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profits/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify({ profitType }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      }
    } catch (error) {
      console.error('Error calculating profits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Calculate Profits</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Profit Type</label>
          <select 
            value={profitType}
            onChange={(e) => setProfitType(e.target.value as any)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="daily">Daily Profit</option>
            <option value="trading">Trading Profit</option>
            <option value="staking">Staking Profit</option>
          </select>
        </div>

        <button
          onClick={calculateProfits}
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate Profits'}
        </button>

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="font-bold text-green-600 mb-2">
              Total Profit: ${result.totalProfitUsd.toFixed(2)}
            </p>
            <div className="space-y-2">
              {result.profits.map((profit: any) => (
                <div key={profit.id} className="text-sm">
                  <p>
                    {profit.currency}: +{profit.amount} 
                    <span className="text-gray-600 ml-2">
                      (${profit.amountUsd.toFixed(2)})
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 6. Complete Page Example

```typescript
// app/trading/page.tsx
'use client';

import { WalletConnect } from '@/components/WalletConnect';
import { DepositForm } from '@/components/DepositForm';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { Dashboard } from '@/components/Dashboard';
import { ProfitCalculator } from '@/components/ProfitCalculator';

export default function TradingPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Trading Platform</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <WalletConnect />
          <DepositForm />
          <ProfitCalculator />
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          <BalanceDisplay />
        </div>

        {/* Right Column */}
        <div>
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
```

## Usage Notes

1. Replace `${userId}` with actual user ID from your auth session
2. Install required packages: `npm install wagmi viem @tanstack/react-query`
3. Configure Wagmi provider in your app layout
4. Customize styling to match your design system
5. Add error handling and loading states as needed
