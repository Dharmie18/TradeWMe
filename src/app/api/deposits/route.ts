// =============================================================================
// DEPOSITS API - List User Deposits
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth-utils';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMING', 'CONFIRMED', 'FAILED', 'REJECTED']).optional(),
  chain: z.enum(['ethereum', 'ethereum-testnet', 'bsc', 'polygon']).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

/**
 * GET /api/deposits
 * List user's deposits with optional filtering
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const validation = querySchema.safeParse({
      status: searchParams.get('status'),
      chain: searchParams.get('chain'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid query parameters',
        error: validation.error.errors[0].message,
      }, { status: 400 });
    }

    const { status, chain, limit, offset } = validation.data;
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;

    // Build where clause
    const where: any = {
      userId: decoded.userId,
    };

    if (status) {
      where.status = status;
    }

    if (chain) {
      where.chain = chain;
    }

    // Get deposits
    const [deposits, totalCount] = await Promise.all([
      prisma.deposit.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limitNum,
        skip: offsetNum,
        include: {
          wallet: {
            select: {
              address: true,
              chain: true,
              walletType: true,
            },
          },
        },
      }),
      prisma.deposit.count({ where }),
    ]);

    // Format deposits
    const formattedDeposits = deposits.map(deposit => ({
      id: deposit.id,
      txHash: deposit.txHash,
      fromAddress: deposit.fromAddress,
      toAddress: deposit.toAddress,
      amount: deposit.amount.toString(),
      currency: deposit.currency,
      chain: deposit.chain,
      amountUsd: deposit.amountUsd.toNumber(),
      status: deposit.status,
      confirmations: deposit.confirmations,
      requiredConfirmations: deposit.requiredConfirmations,
      blockNumber: deposit.blockNumber?.toString(),
      blockTimestamp: deposit.blockTimestamp,
      gasUsed: deposit.gasUsed,
      gasPriceGwei: deposit.gasPriceGwei,
      verifiedAt: deposit.verifiedAt,
      confirmedAt: deposit.confirmedAt,
      createdAt: deposit.createdAt,
      wallet: deposit.wallet,
    }));

    // Calculate summary
    const summary = {
      totalDeposits: totalCount,
      totalAmount: deposits.reduce(
        (sum, d) => sum + d.amountUsd.toNumber(),
        0
      ),
      byStatus: {
        pending: deposits.filter(d => d.status === 'PENDING').length,
        confirming: deposits.filter(d => d.status === 'CONFIRMING').length,
        confirmed: deposits.filter(d => d.status === 'CONFIRMED').length,
        failed: deposits.filter(d => d.status === 'FAILED').length,
        rejected: deposits.filter(d => d.status === 'REJECTED').length,
      },
    };

    return NextResponse.json({
      success: true,
      deposits: formattedDeposits,
      summary,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < totalCount,
      },
    });

  } catch (error) {
    console.error('Deposits fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch deposits',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
