// ============================================================================
// DASHBOARD SUMMARY API - Get complete dashboard data
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userBalances, deposits, profitRecords, userWallets, user } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { calculateUsdValue } from '@/lib/blockchain';
import type { DashboardSummaryResponse } from '@/types/trading';

/**
 * GET /api/dashboard/summary
 * Get complete dashboard summary for user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
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
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get all balances
    const balances = await db
      .select()
      .from(userBalances)
      .where(eq(userBalances.userId, userId));

    // Update USD values with current prices
    const updatedBalances = await Promise.all(
      balances.map(async (balance) => {
        const currentUsd = await calculateUsdValue(balance.balance, balance.currency);
        return {
          currency: balance.currency as any,
          balance: balance.balance,
          balanceUsd: currentUsd,
        };
      })
    );

    // Calculate totals
    const totalBalanceUsd = updatedBalances.reduce((sum, b) => sum + b.balanceUsd, 0);
    const totalDepositsUsd = balances.reduce((sum, b) => {
      const deposited = parseFloat(b.totalDeposited);
      return sum + (deposited * (b.balanceUsd / parseFloat(b.balance || '1')));
    }, 0);
    const totalProfitsUsd = balances.reduce((sum, b) => {
      const profits = parseFloat(b.totalProfits);
      return sum + (profits * (b.balanceUsd / parseFloat(b.balance || '1')));
    }, 0);

    // Calculate profit percentage
    const profitPercentage = totalDepositsUsd > 0 
      ? (totalProfitsUsd / totalDepositsUsd) * 100 
      : 0;

    // Get recent deposits (last 5)
    const recentDepositsData = await db
      .select()
      .from(deposits)
      .where(
        and(
          eq(deposits.userId, userId),
          eq(deposits.status, 'confirmed')
        )
      )
      .orderBy(desc(deposits.depositedAt))
      .limit(5);

    const recentDeposits = recentDepositsData.map(d => ({
      txHash: d.txHash,
      amount: d.amount,
      currency: d.currency as any,
      amountUsd: d.amountUsd,
      depositedAt: d.depositedAt,
    }));

    // Get recent profits (last 5)
    const recentProfitsData = await db
      .select()
      .from(profitRecords)
      .where(
        and(
          eq(profitRecords.userId, userId),
          eq(profitRecords.status, 'applied')
        )
      )
      .orderBy(desc(profitRecords.calculatedAt))
      .limit(5);

    const recentProfits = recentProfitsData.map(p => ({
      amount: p.amount,
      currency: p.currency as any,
      amountUsd: p.amountUsd,
      profitType: p.profitType as any,
      calculatedAt: p.calculatedAt,
    }));

    // Get connected wallet
    const wallet = await db
      .select()
      .from(userWallets)
      .where(
        and(
          eq(userWallets.userId, userId),
          eq(userWallets.isActive, true)
        )
      )
      .limit(1);

    const connectedWallet = wallet.length > 0 ? {
      address: wallet[0].walletAddress,
      type: wallet[0].walletType as any,
    } : undefined;

    return NextResponse.json<DashboardSummaryResponse>({
      success: true,
      summary: {
        totalBalanceUsd,
        totalDepositsUsd,
        totalProfitsUsd,
        profitPercentage,
        balances: updatedBalances,
        recentDeposits,
        recentProfits,
        connectedWallet,
      },
      message: 'Dashboard summary retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch dashboard summary',
      },
      { status: 500 }
    );
  }
}
