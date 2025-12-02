'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Crown, Edit, Wallet } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';
import { format } from 'date-fns';

export function ProfileCard() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const isPremium = user.role === 'premium' || user.role === 'admin';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Profile Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{user.name}</h3>
              {isPremium && (
                <Badge className="gap-1 mt-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                  <Crown className="h-3 w-3" />
                  Premium Member
                </Badge>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono font-medium">{user.id}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Member since:</span>
              <span className="font-medium">
                {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Role:</span>
              <Badge variant="secondary" className="capitalize">
                {user.role || 'user'}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t space-y-2">
            <Link href="/portfolio" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Wallet className="h-4 w-4" />
                View Portfolio
              </Button>
            </Link>
            {!isPremium && (
              <Link href="/premium" className="block">
                <Button className="w-full justify-start gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  <Crown className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
