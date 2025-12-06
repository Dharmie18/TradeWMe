// =============================================================================
// BALANCE API - Get User Balance
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/balance
 * Get user's balance for all currencies
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        error: 'NO_AUTH',
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN',
      }, { status: 401 });
    }

    // Get all balances for user
    const balances = await prisma.balance.findMany({
      where: {
        userId: decoded.userId,
      },
      orderBy: {
        balanceUsd: 'desc',
      },
    });

    // Calculate total balance in USD
    const totalBalanceUsd = balances.reduce(
      (sum, balance) => sum + balance.balanceUsd.toNumber(),
      0
    );

    // Calculate total deposited
    const totalDeposited = balances.reduce(
      (sum, balance) => sum + balance.totalDeposited.toNumber(),
      0
    );

    // Calculate total profits
    const totalProfits = balances.reduce(
      (sum, balance) => sum + balance.totalProfits.toNumber(),
      0
    );

    // Format balances
    const formattedBalances = balances.map(balance => ({
      currency: balance.currency,
      balance: balance.balance.toString(),
      lockedBalance: balance.lockedBalance.toString(),
      availableBalance: (balance.balance.toNumber() - balance.lockedBalance.toNumber()).toString(),
      balanceUsd: balance.balanceUsd.toNumber(),
      totalDeposited: balance.totalDeposited.toString(),
      totalWithdrawn: balance.totalWithdrawn.toString(),
      totalProfits: balance.totalProfits.toString(),
      lastUpdated: balance.lastUpdated,
    }));

    return NextResponse.json({
      success: true,
      balances: formattedBalances,
      summary: {
        totalBalanceUsd,
        totalDeposited,
        totalProfits,
        profitPercentage: totalDeposited > 0 
          ? ((totalProfits / totalDeposited) * 100).toFixed(2)
          : '0.00',
      },
    });

  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch balance',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
