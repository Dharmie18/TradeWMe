// ============================================================================
// PROFIT HISTORY API - Get profit history
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profitRecords } from '@/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import type { ProfitHistoryResponse } from '@/types/trading';

/**
 * GET /api/profits/history
 * Get profit history for user with filters
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json<ProfitHistoryResponse>(
        {
          success: false,
          profits: [],
          total: 0,
          totalProfitUsd: 0,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const profitType = searchParams.get('profitType');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build base query
    let conditions = [eq(profitRecords.userId, userId)];

    // Apply filters
    if (profitType) {
      conditions.push(eq(profitRecords.profitType, profitType));
    }
    if (status) {
      conditions.push(eq(profitRecords.status, status));
    }
    if (startDate) {
      conditions.push(gte(profitRecords.calculatedAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(profitRecords.calculatedAt, endDate));
    }

    // Get profits with filters
    const profits = await db
      .select()
      .from(profitRecords)
      .where(and(...conditions))
      .orderBy(desc(profitRecords.calculatedAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const allProfits = await db
      .select()
      .from(profitRecords)
      .where(and(...conditions));

    // Calculate total profit USD
    const totalProfitUsd = allProfits.reduce((sum, p) => sum + p.amountUsd, 0);

    return NextResponse.json<ProfitHistoryResponse>({
      success: true,
      profits: profits.map(p => ({
        id: p.id,
        currency: p.currency as any,
        amount: p.amount,
        amountUsd: p.amountUsd,
        rate: p.rate,
        profitType: p.profitType as any,
        calculatedAt: p.calculatedAt,
        appliedAt: p.appliedAt || undefined,
        status: p.status as any,
      })),
      total: allProfits.length,
      totalProfitUsd,
      message: 'Profit history retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching profit history:', error);
    return NextResponse.json<ProfitHistoryResponse>(
      {
        success: false,
        profits: [],
        total: 0,
        totalProfitUsd: 0,
        message: 'Failed to fetch profit history',
      },
      { status: 500 }
    );
  }
}
