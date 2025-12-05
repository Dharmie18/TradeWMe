'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BalanceDisplay } from '@/components/dashboard/BalanceDisplay';
import { WalletConnection } from '@/components/dashboard/WalletConnection';
import { SimulationBanner } from '@/components/dashboard/SimulationBanner';
import { Loader2 } from 'lucide-react';

export default function TradingDashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/dashboard/trading');
    }
  }, [session, isPending, router]);

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

  if (!session?.user) {
    return null;
  }

  // Get account type from session (you'll need to add this to your session)
  const accountType = (session.user as any).accountType || 'REAL';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Trading Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your portfolio and start trading
            </p>
          </div>

          {/* Simulation Banner (Demo Accounts Only) */}
          <div className="mb-6">
            <SimulationBanner 
              accountType={accountType}
              userId={session.user.id}
            />
          </div>

          {/* Dashboard Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Balance & Wallet */}
            <div className="lg:col-span-2 space-y-6">
              <BalanceDisplay />
            </div>

            {/* Right Column - Wallet Connection */}
            <div className="space-y-6">
              <WalletConnection />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
