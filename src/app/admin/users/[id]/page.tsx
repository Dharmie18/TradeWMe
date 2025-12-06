'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Wallet,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
}

interface Transaction {
  id: number;
  txHash: string;
  type: string;
  tokenIn: string | null;
  tokenOut: string | null;
  amountIn: number | null;
  amountOut: number | null;
  gasFee: number | null;
  status: string;
  timestamp: string;
}

export default function AdminUserDetailsPage() {
  // Temporary: Return simple page for build
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">User Details</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    </div>
  );
  
  // Original code commented out for build
  /*
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push('/login?redirect=/admin');
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (session?.user && userId) {
      fetchUserData();
    }
  }, [session, userId]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('bearer_token');

      const [userRes, transactionsRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/transactions/list?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (userRes.status === 403) {
        toast.error('Admin access required');
        router.push('/');
        return;
      }

      if (!userRes.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userRes.json();
      setUser(userData.user);

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId: number) => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/admin/transactions-management', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId,
          status: 'confirmed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve transaction');
      }

      toast.success('Transaction approved successfully');
      fetchUserData();
    } catch (err) {
      toast.error('Failed to approve transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/admin/transactions-management', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      toast.success('Transaction deleted successfully');
      fetchUserData();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (sessionLoading || loading) {
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

  if (!session?.user || error || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error || 'User not found'}</p>
              <Link href="/admin">
                <Button className="mt-4">Back to Admin</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amountOut || 0), 0);
  const confirmedTransactions = transactions.filter(tx => tx.status === 'confirmed').length;
  const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;
  const failedTransactions = transactions.filter(tx => tx.status === 'failed').length;

  */
}
