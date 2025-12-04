'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownUp, Settings2, Zap, RefreshCw } from 'lucide-react';
import { TokenSelector } from './TokenSelector';
import { SlippageSettings } from './SlippageSettings';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { type Address } from 'viem';

export function SwapInterface() {
  const { isConnected, address } = useAccount();
  const [tokenIn, setTokenIn] = useState({ symbol: 'ETH', address: '0xEth', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' });
  const [tokenOut, setTokenOut] = useState({ symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' });
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // Fetch Balance for Token In
  const { data: balanceIn } = useBalance({
    address,
    token: tokenIn.address === '0xEth' ? undefined : (tokenIn.address as Address),
  });

  // Fetch Balance for Token Out
  const { data: balanceOut } = useBalance({
    address,
    token: tokenOut.address === '0xEth' ? undefined : (tokenOut.address as Address),
  });

  // Fetch real-time exchange rate
  const fetchExchangeRate = async () => {
    if (!amountIn || parseFloat(amountIn) === 0) {
      setAmountOut('');
      return;
    }

    setIsLoadingRate(true);
    try {
      const response = await fetch('/api/crypto/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: tokenIn.symbol,
          to: tokenOut.symbol,
          amount: amountIn,
        }),
      });

      const data = await response.json();
      if (data.success && data.rate) {
        setExchangeRate(data.rate);
        setAmountOut((parseFloat(amountIn) * data.rate).toFixed(6));
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Auto-update exchange rate when amount or tokens change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExchangeRate();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [amountIn, tokenIn, tokenOut]);

  // Real-time price updates every 10 seconds
  useEffect(() => {
    if (!amountIn) return;

    const interval = setInterval(() => {
      fetchExchangeRate();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [amountIn, tokenIn, tokenOut]);

  const handleSwapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  };

  const handleSwap = async () => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      // Call swap API
      const response = await fetch('/api/swap/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amount: amountIn,
          slippage,
        }),
      });

      const data = await response.json();
      console.log('Swap quote:', data);
      // Execute swap transaction here
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            Swap
            {isLoadingRate && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings && (
          <SlippageSettings value={slippage} onChange={setSlippage} />
        )}

        {/* Token In */}
        <div className="space-y-2">
          <Label className="text-sm">From</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="text-xl md:text-2xl h-12 md:h-14"
              />
            </div>
            <TokenSelector
              selectedToken={tokenIn}
              onSelect={setTokenIn}
            />
          </div>
          <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
            <span>
              Balance: {balanceIn ? `${parseFloat(balanceIn.formatted).toFixed(4)} ${balanceIn.symbol}` : '0.00'}
            </span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs md:text-sm"
              onClick={() => balanceIn && setAmountIn(balanceIn.formatted)}
            >
              MAX
            </Button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapTokens}
            className="rounded-full h-10 w-10"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Token Out */}
        <div className="space-y-2">
          <Label className="text-sm">To</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={amountOut}
                onChange={(e) => setAmountOut(e.target.value)}
                className="text-xl md:text-2xl h-12 md:h-14"
              />
            </div>
            <TokenSelector
              selectedToken={tokenOut}
              onSelect={setTokenOut}
            />
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">
            Balance: {balanceOut ? `${parseFloat(balanceOut.formatted).toFixed(4)} ${balanceOut.symbol}` : '0.00'}
          </div>
        </div>

        {/* Swap Details */}
        {amountIn && amountOut && (
          <div className="rounded-lg border bg-muted/40 p-3 md:p-4 space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">
                1 {tokenIn.symbol} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(4)} {tokenOut.symbol}
              </span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Price Impact</span>
              <span className="text-green-500">{'<0.01%'}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Estimated Gas</span>
              <span className="font-medium">$2.45</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Minimum Received</span>
              <span className="font-medium">
                {(parseFloat(amountOut) * (1 - slippage / 100)).toFixed(4)} {tokenOut.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button onClick={openConnectModal} className="w-full" size="lg">
                Connect Wallet
              </Button>
            )}
          </ConnectButton.Custom>
        ) : (
          <Button
            onClick={handleSwap}
            className="w-full gap-2"
            size="lg"
            disabled={!amountIn || !amountOut || isLoading}
          >
            {isLoading ? (
              'Swapping...'
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Swap
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}