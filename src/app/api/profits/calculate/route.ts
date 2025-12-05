import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/auth-utils';

const prisma = new PrismaClient();

/**
 * Calculate profit for user based on their settings
 */
async function calculateUserProfit(userId: string) {
  // Get user's profit settings
  const settings = await prisma.profitSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    // Create default settings
    await prisma.profitSettings.create({
      data: {
        userId,
        dailyProfitRate: 0.02, // 2% daily
        tradingProfitRate: 0.05, // 5% trading
        compoundingEnabled: false,
        autoApplyProfits: true,
        minBalanceForProfits: 0.01,
      },
    });
    return null;
  }

  // Get user's balances
  const balances = await prisma.balance.findMany({
    where: { userId },
  });

  // Calculate profits for each balance
  const profits = [];
  for (const balance of balances) {
    const balanceAmount = balance.balance.toNumber();
    
    // Skip if below minimum
    if (balanceAmount < settings.minBalanceForProfits.toNumber()) {
      continue;
    }

    // Calculate daily profit
    const profitAmount = balanceAmount * settings.dailyProfitRate.toNumber();
    
    if (profitAmount > 0) {
      profits.push({
        currency: balance.currency,
        baseAmount: balanceAmount,
        profitAmount,
        rate: settings.dailyProfitRate.toNumber(),
      });
    }
  }

  return profits;
}

/**
 * POST /api/profits/calculate
 * Calculate and optionally apply profits
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token',
      }, { status: 401 });
    }

    const body = await request.json();
    const { apply = false } = body;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    // Calculate profits
    const profits = await calculateUserProfit(decoded.userId);

    if (!profits || profits.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No profits to calculate',
        profits: [],
      });
    }

    // Check for active simulation (demo accounts only)
    const activeSimulation = user.accountType === 'DEMO'
      ? await prisma.simulationAdjustment.findFirst({
          where: {
            userId: decoded.userId,
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        })
      : null;

    // Apply simulation multiplier if active
    const adjustedProfits = profits.map(profit => {
      let adjustedAmount = profit.profitAmount;
      let isSimulated = false;
      let simulationMultiplier = null;

      if (activeSimulation && activeSimulation.adjustmentType === 'profit_multiplier') {
        adjustedAmount *= activeSimulation.multiplier?.toNumber() || 1;
        isSimulated = true;
        simulationMultiplier = activeSimulation.multiplier?.toNumber();
      }

      return {
        ...profit,
        profitAmount: adjustedAmount,
        isSimulated,
        simulationMultiplier,
      };
    });

    // If apply is true, create profit records and update balances
    if (apply) {
      for (const profit of adjustedProfits) {
        // Create profit record
        const profitRecord = await prisma.profitRecord.create({
          data: {
            userId: decoded.userId,
            profitType: 'DAILY',
            amount: profit.profitAmount,
            amountUsd: profit.profitAmount, // Simplified, should use price conversion
            currency: profit.currency,
            rate: profit.rate,
            baseAmount: profit.baseAmount,
            isSimulated: profit.isSimulated,
            simulationMultiplier: profit.simulationMultiplier,
            status: 'APPLIED',
            appliedAt: new Date(),
          },
        });

        // Update balance
        await prisma.balance.update({
          where: {
            userId_currency: {
              userId: decoded.userId,
              currency: profit.currency,
            },
          },
          data: {
            balance: {
              increment: profit.profitAmount,
            },
            totalProfits: {
              increment: profit.profitAmount,
            },
            lastUpdated: new Date(),
          },
        });

        // Log action
        await prisma.auditLog.create({
          data: {
            userId: decoded.userId,
            action: profit.isSimulated ? 'profit_applied_simulated' : 'profit_applied',
            entity: 'profit',
            entityId: profitRecord.id,
            newData: {
              currency: profit.currency,
              amount: profit.profitAmount,
              isSimulated: profit.isSimulated,
              simulationMultiplier: profit.simulationMultiplier,
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.ip,
            userAgent: request.headers.get('user-agent'),
          },
        });
      }

      // Update last calculation time
      await prisma.profitSettings.update({
        where: { userId: decoded.userId },
        data: { lastProfitCalculation: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      message: apply ? 'Profits calculated and applied' : 'Profits calculated',
      profits: adjustedProfits,
      applied: apply,
      simulationActive: !!activeSimulation,
    });

  } catch (error) {
    console.error('Profit calculation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to calculate profits',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
