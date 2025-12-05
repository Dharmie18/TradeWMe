// =============================================================================
// ADMIN API - All Deposits
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/auth-utils';
import { z } from 'zod';

const prisma = new PrismaClient();

function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

const querySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMING', 'CONFIRMED', 'FAILED', 'REJECTED']).optional(),
  chain: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

/**
 * GET /api/admin/deposits
 * List all deposits with user info (admin only)
 */
export async function GET(request: NextRequest) {
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
    
    if (!decoded || !isAdmin(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Access denied. Admin role required.',
      }, { status: 403 });
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
      }, { status: 400 });
    }

    const { status, chain, limit, offset } = validation.data;
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (chain) where.chain = chain;

    // Get deposits with user info
    const [deposits, totalCount] = await Promise.all([
      prisma.deposit.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              accountType: true,
            },
          },
          wallet: {
            select: {
              address: true,
              chain: true,
              walletType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip: offsetNum,
      }),
      prisma.deposit.count({ where }),
    ]);

    // Calculate statistics
    const stats = {
      total: totalCount,
      totalAmount: deposits.reduce((sum, d) => sum + d.amountUsd.toNumber(), 0),
      byStatus: {
        pending: deposits.filter(d => d.status === 'PENDING').length,
        confirming: deposits.filter(d => d.status === 'CONFIRMING').length,
        confirmed: deposits.filter(d => d.status === 'CONFIRMED').length,
        failed: deposits.filter(d => d.status === 'FAILED').length,
      },
      byChain: {
        ethereum: deposits.filter(d => d.chain === 'ethereum').length,
        bsc: deposits.filter(d => d.chain === 'bsc').length,
        polygon: deposits.filter(d => d.chain === 'polygon').length,
      },
    };

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        adminId: decoded.userId,
        action: 'admin_view_deposits',
        entity: 'deposit',
        metadata: {
          filters: { status, chain },
          resultCount: deposits.length,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      deposits: deposits.map(d => ({
        ...d,
        amount: d.amount.toString(),
        amountUsd: d.amountUsd.toNumber(),
        blockNumber: d.blockNumber?.toString(),
      })),
      stats,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < totalCount,
      },
    });

  } catch (error) {
    console.error('Admin deposits fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch deposits',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
