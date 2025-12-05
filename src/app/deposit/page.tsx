'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DepositForm } from '@/components/deposit/DepositForm';
import { DepositHistory } from '@/components/deposit/DepositHistory';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DepositPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/deposit');
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
          {/* Back Button */}
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Deposit Funds</h1>
            <p className="text-muted-foreground mt-2">
              Add cryptocurrency to your trading account
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'deposit'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Make Deposit
              {activeTab === 'deposit' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'history'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Deposit History
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Content */}
          {activeTab === 'deposit' ? (
            <DepositForm />
          ) : (
            <DepositHistory />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
