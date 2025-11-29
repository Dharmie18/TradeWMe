'use client';

import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Crown } from 'lucide-react';
import { format } from 'date-fns';

/**
 * ProfileCard component displays user profile information
 * Shows user details like name, email, join date, and premium status
 */
export function ProfileCard() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Your account details and preferences
        </CardDescription>
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
                {user.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Free Tier
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Member since:</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {user.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'Unknown'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Account type:</span>
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {user.role || 'User'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            To upgrade to premium or manage your account settings, visit the premium page.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
