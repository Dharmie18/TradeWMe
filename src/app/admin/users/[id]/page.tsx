'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Mail, Calendar, Crown, Activity, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  walletAddress?: string;
  premiumTier: string;
  premiumExpiresAt?: string;
  transactionCount: number;
  totalVolume: number;
}

interface Transaction {
  id: number;
  txHash: string;
  type: string;
  amountIn?: number;
  amountOut?: number;
  gasFee?: number;
  status: string;
  timestamp: string;
}

/**
 * AdminUserDetails component displays detailed information about a specific user
 * Only accessible to admin users with proper authorization
 */
export default function AdminUserDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const userId = params.id as string;

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push('/login?redirect=/admin/users/' + userId);
        return;
      }
      if (session.user.role !== 'admin') {
        toast.error('Admin access required');
        router.push('/dashboard');
        return;
      }
      fetchUserDetails();
    }
  }, [session, isPending, userId, router]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        toast.error('Admin access required');
        router.push('/admin');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async () => {
    if (!user) return;

    setTransactionsLoading(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/admin/users/${userId}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
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

  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">User not found</h2>
            <p className="text-muted-foreground mb-4">The requested user could not be found.</p>
            <Button onClick={() => router.push('/admin')} variant="outline">
              Back to Admin Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">User Details</h1>
              <p className="text-muted-foreground mt-2">
                Detailed information for {user.name || user.email}
              </p>
            </div>
          </div>

          {/* User Profile Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{user.name || 'Anonymous User'}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      {user.premiumTier}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Joined:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Transactions:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.transactionCount}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Total Volume:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ${user.totalVolume.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Wallet:</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {user.walletAddress ?
                      `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` :
                      'Not connected'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for additional details */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transactions" onClick={fetchUserTransactions}>
                Transactions
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    All transactions for this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="text-sm">
                              <div className="font-medium">{tx.type}</div>
                              <div className="text-muted-foreground font-mono">
                                {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {tx.amountIn && `$${tx.amountIn.toFixed(2)}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Gas: {tx.gasFee?.toFixed(6) || 0}
                            </div>
                            <Badge variant={tx.status === 'completed' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'}>
                              {tx.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>
                    Recent activity and engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Activity tracking coming soon</p>
                    <p className="text-sm">This feature will show login history, page views, and other user activities.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
