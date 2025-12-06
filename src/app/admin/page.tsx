'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, Activity, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TransactionsTable } from '@/components/admin/TransactionsTable';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { AlertsSection } from '@/components/admin/AlertsSection';
import { UsersTable } from '@/components/admin/UsersTable';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  completedTransactions: number;
  totalVolumeUsd: number;
  averageTransactionValue: number;
  averageGasFee: number;
  totalGasPaid: number;
}

export default function AdminDashboard() {
  // Temporary: Return simple page for build
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    </div>
  );
  
  // Original code commented out for build
  /*
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/admin');
    }
  }, [session, isPending, router]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        toast.error('Admin access required');
        router.push('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchAnalytics();
    }
  }, [session]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (isPending || loading) {
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

  */
}