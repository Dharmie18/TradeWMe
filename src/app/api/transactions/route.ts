// =============================================================================
// TRANSACTIONS API - Transaction History
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/auth-utils';
import { z } from 'zod';

const prisma = new PrismaClient();

const querySchema = z.object({
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'SWAP', 'TRANSFER']).optional(),
  chain: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

/**
 * GET /api/transactions
 * Get user's transaction history
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
      type: searchParams.get('type'),
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

    const { type, chain, limit, offset } = validation.data;
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;

    // Build where clause
    const where: any = {
      userId: decoded.userId,
    };

    if (type) {
      where.type = type;
    }

    if (chain) {
      where.chain = chain;
    }

    // Get transactions
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        take: limitNum,
        skip: offsetNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Format transactions
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      txHash: tx.txHash,
      type: tx.type,
      fromToken: tx.fromToken,
      toToken: tx.toToken,
      amountIn: tx.amountIn?.toString(),
      amountOut: tx.amountOut?.toString(),
      chain: tx.chain,
      status: tx.status,
      gasUsed: tx.gasUsed,
      gasFee: tx.gasFee?.toString(),
      timestamp: tx.timestamp,
      createdAt: tx.createdAt,
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < totalCount,
      },
    });

  } catch (error) {
    console.error('Transactions fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
