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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin">
              <Button variant="ghost" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">User Details</h1>
            <p className="text-muted-foreground mt-2">
              Manage user information and transactions
            </p>
          </div>

          {/* User Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold">
                      ${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmed</p>
                    <p className="text-2xl font-bold text-green-500">{confirmedTransactions}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-500">{pendingTransactions}</p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-500">{failedTransactions}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Management</CardTitle>
              <CardDescription>
                View, approve, or delete user transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions found for this user</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {getStatusIcon(tx.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium capitalize">{tx.type}</p>
                            <Badge variant="secondary" className="capitalize">
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}
                            </p>
                            <a
                              href={`https://etherscan.io/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 font-mono"
                            >
                              {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tx.tokenIn && `${tx.amountIn?.toFixed(4)} ${tx.tokenIn}`}
                            {tx.tokenIn && tx.tokenOut && ' → '}
                            {tx.tokenOut && `${tx.amountOut?.toFixed(4)} ${tx.tokenOut}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {tx.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleApproveTransaction(tx.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this transaction? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
