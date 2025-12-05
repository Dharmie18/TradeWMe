'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Info, 
  X,
  Eye,
  TrendingUp
} from 'lucide-react';

interface SimulationAdjustment {
  id: string;
  adjustmentType: string;
  multiplier?: string;
  amount?: string;
  reason: string;
  isActive: boolean;
  appliedAt: string;
  expiresAt?: string;
}

interface SimulationBannerProps {
  accountType: 'REAL' | 'DEMO';
  userId?: string;
}

export function SimulationBanner({ accountType, userId }: SimulationBannerProps) {
  const [adjustments, setAdjustments] = useState<SimulationAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only fetch for DEMO accounts
    if (accountType === 'DEMO' && userId) {
      fetchSimulationAdjustments();
    } else {
      setIsLoading(false);
    }
  }, [accountType, userId]);

  const fetchSimulationAdjustments = async () => {
    try {
      const response = await fetch(`/api/admin/simulate?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Filter only active adjustments
        const activeAdjustments = data.adjustments.filter((adj: SimulationAdjustment) => adj.isActive);
        setAdjustments(activeAdjustments);
      }
    } catch (err) {
      console.error('Failed to fetch simulation adjustments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show banner for REAL accounts
  if (accountType === 'REAL') {
    return null;
  }

  // Don't show if dismissed
  if (isDismissed) {
    return null;
  }

  // Don't show if loading or no adjustments
  if (isLoading || adjustments.length === 0) {
    return null;
  }

  const getAdjustmentIcon = (type: string) => {
    switch (type) {
      case 'profit_multiplier':
        return <TrendingUp className="h-5 w-5" />;
      case 'balance_adjustment':
        return <Eye className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getAdjustmentLabel = (type: string) => {
    switch (type) {
      case 'profit_multiplier':
        return 'Profit Multiplier';
      case 'balance_adjustment':
        return 'Balance Adjustment';
      default:
        return 'Adjustment';
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Demo Account Banner */}
      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100 font-semibold">
          Demo Account - Simulation Mode Active
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <p className="mb-2">
            This is a <strong>DEMO account</strong> for testing purposes. 
            All transactions and balances are simulated and not real.
          </p>
          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100">
            <Eye className="h-3 w-3 mr-1" />
            Simulation Visible
          </Badge>
        </AlertDescription>
      </Alert>

      {/* Active Adjustments */}
      {adjustments.map((adjustment) => (
        <Alert 
          key={adjustment.id}
          className="border-blue-500 bg-blue-50 dark:bg-blue-950/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                {getAdjustmentIcon(adjustment.adjustmentType)}
              </div>
              <div className="flex-1">
                <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold mb-2">
                  {getAdjustmentLabel(adjustment.adjustmentType)} Active
                </AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200 space-y-2">
                  {adjustment.adjustmentType === 'profit_multiplier' && adjustment.multiplier && (
                    <p>
                      <strong>Multiplier:</strong> {adjustment.multiplier}x
                    </p>
                  )}
                  {adjustment.adjustmentType === 'balance_adjustment' && adjustment.amount && (
                    <p>
                      <strong>Adjustment:</strong> {adjustment.amount}
                    </p>
                  )}
                  <p>
                    <strong>Reason:</strong> {adjustment.reason}
                  </p>
                  <p className="text-xs">
                    Applied: {new Date(adjustment.appliedAt).toLocaleDateString()}
                    {adjustment.expiresAt && (
                      <> • Expires: {new Date(adjustment.expiresAt).toLocaleDateString()}</>
                    )}
                  </p>
                </AlertDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDismissed(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}

      {/* Transparency Notice */}
      <Alert className="border-gray-300 bg-gray-50 dark:bg-gray-900/20">
        <Info className="h-4 w-4 text-gray-600" />
        <AlertDescription className="text-xs text-gray-700 dark:text-gray-300">
          <strong>Full Transparency:</strong> All simulation adjustments are visible to you and logged in the audit trail.
          This platform operates with complete transparency for demo accounts.
        </AlertDescription>
      </Alert>
    </div>
  );
}
