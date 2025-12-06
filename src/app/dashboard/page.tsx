'use client';

import { useRequireAuth } from '@/lib/auth-check';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SavedItems } from '@/components/dashboard/SavedItems';
import { PersonalStats } from '@/components/dashboard/PersonalStats';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useRequireAuth('/login');

  if (isLoading) {
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

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back, {user.name || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your trading account
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
