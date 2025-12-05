'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TradingChart } from '@/components/trading/TradingChart';
import { RealTimePrices } from '@/components/trading/RealTimePrices';
import { SwapInterface } from '@/components/trade/SwapInterface';
import { RecentTrades } from '@/components/trade/RecentTrades';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TradePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Check if user has verified email
  const isEmailVerified = session?.user?.emailVerified;
  
  // Check if user has balance (you'll need to fetch this)
  const hasBalance = false; // TODO: Fetch from balance API

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Trade</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Real-time cryptocurrency trading with live market data
          </p>
        </div>

        {/* Email Verification Alert */}
        {!session?.user && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Sign up to start trading.</strong> Create an account and verify your email to access trading features.
              <div className="mt-3">
                <Link href="/register">
                  <Button size="sm">Create Account</Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {session?.user && !isEmailVerified && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Email verification required.</strong> Please verify your email to start trading.
            </AlertDescription>
          </Alert>
        )}

        {/* No Balance Alert */}
        {session?.user && isEmailVerified && !hasBalance && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>No funds available.</strong> Make a deposit to start trading.
              <div className="mt-3">
                <Link href="/deposit">
                  <Button size="sm">Make Deposit</Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-1">
            <TradingChart />
            <RealTimePrices />
          </div>

          {/* Swap Interface Sidebar */}
          <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
            <SwapInterface />
            <RecentTrades />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}