// ============================================================================
// PROFIT CALCULATION API - Calculate and apply profits
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profitRecords, profitSettings, userBalances, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculateUsdValue } from '@/lib/blockchain';
import type { ProfitCalculationRequest, ProfitCalculationResponse } from '@/types/trading';

/**
 * POST /api/profits/calculate
 * Calculate profits based on user settings and current balance
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json<ProfitCalculationResponse>(
        {
          success: false,
          profits: [],
          totalProfitUsd: 0,
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
      return NextResponse.json<ProfitCalculationResponse>(
        {
          success: false,
          profits: [],
          totalProfitUsd: 0,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body: ProfitCalculationRequest = await request.json();
    const { profitType, currency, customRate } = body;

    // Get user's profit settings
    const settings = await db
      .select()
      .from(profitSettings)
      .where(eq(profitSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      // Create default settings if not exists
      const now = new Date().toISOString();
      await db.insert(profitSettings).values({
        userId,
        dailyProfitRate: 0.02,
        tradingProfitRate: 0.05,
        compoundingEnabled: false,
        autoApplyProfits: true,
        minBalanceForProfits: '0.01',
        createdAt: now,
        updatedAt: now,
      });
    }

    const userSettings = settings[0] || {
      dailyProfitRate: 0.02,
      tradingProfitRate: 0.05,
      compoundingEnabled: false,
      autoApplyProfits: true,
      minBalanceForProfits: '0.01',
    };

    // Determine profit rate
    let profitRate = customRate;
    if (!profitRate) {
      profitRate = profitType === 'daily' 
        ? userSettings.dailyProfitRate 
        : userSettings.tradingProfitRate;
    }

    // Get user balances
    let balances = await db
      .select()
      .from(userBalances)
      .where(eq(userBalances.userId, userId));

    // Filter by currency if specified
    if (currency) {
      balances = balances.filter(b => b.currency === currency);
    }

    // Filter balances above minimum
    const minBalance = parseFloat(userSettings.minBalanceForProfits);
    balances = balances.filter(b => parseFloat(b.balance) >= minBalance);

    if (balances.length === 0) {
      return NextResponse.json<ProfitCalculationResponse>({
        success: true,
        profits: [],
        totalProfitUsd: 0,
        message: 'No eligible balances for profit calculation',
      });
    }

    // Calculate profits for each balance
    const now = new Date().toISOString();
    const calculatedProfits = [];

    for (const balance of balances) {
      // Calculate base amount (use balance or balance + profits if compounding)
      const baseAmount = userSettings.compoundingEnabled
        ? (parseFloat(balance.balance) + parseFloat(balance.totalProfits)).toString()
        : balance.balance;

      const baseNum = parseFloat(baseAmount);
      const profitAmount = (baseNum * profitRate).toString();
      const profitUsd = await calculateUsdValue(profitAmount, balance.currency);

      // Create profit record
      const newProfit = await db
        .insert(profitRecords)
        .values({
          userId,
          balanceId: balance.id,
          profitType,
          amount: profitAmount,
          amountUsd: profitUsd,
          currency: balance.currency,
          rate: profitRate,
          baseAmount,
          calculatedAt: now,
          appliedAt: null,
          status: 'pending',
          metadata: JSON.stringify({
            compounding: userSettings.compoundingEnabled,
            autoApply: userSettings.autoApplyProfits,
          }),
          createdAt: now,
        })
        .returning();

      calculatedProfits.push({
        id: newProfit[0].id,
        currency: newProfit[0].currency as any,
        amount: newProfit[0].amount,
        amountUsd: newProfit[0].amountUsd,
        rate: newProfit[0].rate,
        baseAmount: newProfit[0].baseAmount,
        profitType: newProfit[0].profitType as any,
        calculatedAt: newProfit[0].calculatedAt,
        status: 'pending' as const,
      });

      // Auto-apply if enabled
      if (userSettings.autoApplyProfits) {
        await applyProfit(newProfit[0].id, userId, balance.id, profitAmount, balance.currency);
        calculatedProfits[calculatedProfits.length - 1].status = 'applied';
      }
    }

    // Update last calculation time
    await db
      .update(profitSettings)
      .set({
        lastProfitCalculation: now,
        updatedAt: now,
      })
      .where(eq(profitSettings.userId, userId));

    const totalProfitUsd = calculatedProfits.reduce((sum, p) => sum + p.amountUsd, 0);

    return NextResponse.json<ProfitCalculationResponse>({
      success: true,
      profits: calculatedProfits,
      totalProfitUsd,
      message: userSettings.autoApplyProfits
        ? 'Profits calculated and applied to your account'
        : 'Profits calculated successfully',
    });
  } catch (error) {
    console.error('Error calculating profits:', error);
    return NextResponse.json<ProfitCalculationResponse>(
      {
        success: false,
        profits: [],
        totalProfitUsd: 0,
        message: 'Failed to calculate profits',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to apply profit to user balance
 */
async function applyProfit(
  profitId: number,
  userId: string,
  balanceId: number,
  profitAmount: string,
  currency: string
) {
  const now = new Date().toISOString();

  // Get current balance
  const balance = await db
    .select()
    .from(userBalances)
    .where(eq(userBalances.id, balanceId))
    .limit(1);

  if (balance.length === 0) return;

  // Update balance
  const currentBalance = parseFloat(balance[0].balance);
  const currentProfits = parseFloat(balance[0].totalProfits);
  const profitNum = parseFloat(profitAmount);

  const newBalance = (currentBalance + profitNum).toString();
  const newTotalProfits = (currentProfits + profitNum).toString();
  const newBalanceUsd = await calculateUsdValue(newBalance, currency);

  await db
    .update(userBalances)
    .set({
      balance: newBalance,
      totalProfits: newTotalProfits,
      balanceUsd: newBalanceUsd,
      lastUpdated: now,
    })
    .where(eq(userBalances.id, balanceId));

  // Update profit record status
  await db
    .update(profitRecords)
    .set({
      status: 'applied',
      appliedAt: now,
    })
    .where(eq(profitRecords.id, profitId));
}
