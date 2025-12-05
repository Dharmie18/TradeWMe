'use client';

import { useState, useEffect } from 'react';

interface Wallet {
  id: string;
  address: string;
  chain: string;
  walletType: string;
  initialBalance: number;
  connectedAt: string;
}

export default function WalletConnect() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const connectWallet = async (walletType: 'metamask' | 'walletconnect' | 'coinbase') => {
    setConnecting(true);
    setError('');
    setSuccess('');

    try {
      // Check if wallet is available
      if (walletType === 'metamask' && !window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask extension.');
        setConnecting(false);
        return;
      }

      // Request account access
      let accounts: string[] = [];
      let chainId: string = '';

      if (walletType === 'metamask') {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        chainId = await window.ethereum.request({ method: 'eth_chainId' });
      }

      if (accounts.length === 0) {
        setError('No accounts found. Please unlock your wallet.');
        setConnecting(false);
        return;
      }

      const address = accounts[0];
      
      // Determine chain
      const chainMap: Record<string, string> = {
        '0x1': 'ethereum',
        '0x38': 'bsc',
        '0x89': 'polygon',
      };
      const chain = chainMap[chainId] || 'ethereum';

      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setConnecting(false);
        return;
      }

      // Call API to connect wallet
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          chain,
          walletType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to connect wallet');
        setConnecting(false);
        return;
      }

      // Success
      setSuccess('Wallet connected successfully! Balance is 0 until you make a deposit.');
      setWallets([...wallets, data.wallet]);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);

    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-green-700">
          {success}
        </div>
      )}

      {wallets.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Connected Wallets</h3>
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{formatAddress(wallet.address)}</p>
                  <p className="text-sm text-gray-600">
                    {wallet.chain} • {wallet.walletType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="font-semibold">${wallet.initialBalance.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => connectWallet('metamask')}
          disabled={connecting}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-2xl">🦊</span>
          {connecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>

        <button
          onClick={() => connectWallet('walletconnect')}
          disabled={connecting}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-2xl">🔗</span>
          {connecting ? 'Connecting...' : 'Connect WalletConnect'}
        </button>

        <button
          onClick={() => connectWallet('coinbase')}
          disabled={connecting}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-2xl">💼</span>
          {connecting ? 'Connecting...' : 'Connect Coinbase Wallet'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your balance will be 0 until you make a deposit. 
          After connecting, you can deposit funds to start trading.
        </p>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
