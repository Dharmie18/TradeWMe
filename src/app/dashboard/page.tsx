'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SavedItems } from '@/components/dashboard/SavedItems';
import { PersonalStats } from '@/components/dashboard/PersonalStats';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      console.log('No session found, redirecting to login');
      router.push('/login?redirect=/dashboard');
    } else if (session?.user) {
      console.log('Session found:', session.user);
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
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back, {session.user.name}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your PocketBroker account
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Profile & Stats */}
            <div className="space-y-6">
              <ProfileCard />
              <SavedItems />
            </div>

            {/* Middle & Right Columns - Activity & Stats */}
            <div className="lg:col-span-2 space-y-6">
              <PersonalStats />
              <RecentActivity />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
