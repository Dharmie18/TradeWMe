// ============================================================================
// BALANCE API - Get and manage user balances
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userBalances, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { calculateUsdValue } from '@/lib/blockchain';
import type { BalanceResponse } from '@/types/trading';

/**
 * GET /api/balance
 * Get all balances for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json<BalanceResponse>(
        {
          success: false,
          balances: [],
          totalBalanceUsd: 0,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Validate user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json<BalanceResponse>(
        {
          success: false,
          balances: [],
          totalBalanceUsd: 0,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get all balances for user
    const balances = await db
      .select()
      .from(userBalances)
      .where(eq(userBalances.userId, userId));

    // Update USD values with current prices
    const updatedBalances = await Promise.all(
      balances.map(async (balance) => {
        const balanceNum = parseFloat(balance.balance);
        const lockedNum = parseFloat(balance.lockedBalance);
        const availableBalance = (balanceNum - lockedNum).toString();
        
        // Recalculate USD value with current price
        const currentUsd = await calculateUsdValue(balance.balance, balance.currency);

        return {
          currency: balance.currency as any,
          balance: balance.balance,
          lockedBalance: balance.lockedBalance,
          availableBalance,
          totalDeposited: balance.totalDeposited,
          totalWithdrawn: balance.totalWithdrawn,
          totalProfits: balance.totalProfits,
          balanceUsd: currentUsd,
          lastUpdated: balance.lastUpdated,
        };
      })
    );

    // Calculate total balance in USD
    const totalBalanceUsd = updatedBalances.reduce(
      (sum, b) => sum + b.balanceUsd,
      0
    );

    return NextResponse.json<BalanceResponse>({
      success: true,
      balances: updatedBalances,
      totalBalanceUsd,
      message: 'Balances retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching balances:', error);
    return NextResponse.json<BalanceResponse>(
      {
        success: false,
        balances: [],
        totalBalanceUsd: 0,
        message: 'Failed to fetch balances',
      },
      { status: 500 }
    );
  }
}
