'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Activity, Heart, BarChart3 } from 'lucide-react';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SavedItems } from '@/components/dashboard/SavedItems';
import { PersonalStats } from '@/components/dashboard/PersonalStats';
import { UserProfileHeader } from '@/components/dashboard/UserProfileHeader';
import { FinancialStats } from '@/components/dashboard/FinancialStats';
import { MarketTicker } from '@/components/dashboard/MarketTicker';

/**
 * UserDashboard component provides a personalized dashboard for logged-in users
 * Displays profile info, recent activity, saved items, and personalized statistics
 * Only shows data belonging to the logged-in user with proper authorization
 */
export default function UserDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/dashboard');
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-blue-950/5 to-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8 space-y-6">
          {/* User Profile Header */}
          <div className="animate-fade-in">
            <UserProfileHeader />
          </div>

          {/* Financial Stats Cards */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <FinancialStats />
          </div>

          {/* Market Ticker */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <MarketTicker />
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Saved Items
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 animate-stagger-fade">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="animate-slide-in-left">
                  <ProfileCard />
                </div>
                <div className="animate-slide-in-right">
                  <RecentActivity />
                </div>
              </div>
              <div className="animate-bounce-in">
                <SavedItems />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6 animate-stagger-fade">
              <div className="animate-scale-in">
                <ProfileCard />
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6 animate-stagger-fade">
              <div className="animate-slide-up">
                <RecentActivity />
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-6 animate-stagger-fade">
              <div className="animate-bounce-in">
                <SavedItems />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

