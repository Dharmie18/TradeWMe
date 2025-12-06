// =============================================================================
// ADMIN API - User Management
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth-utils';
import { z } from 'zod';

const querySchema = z.object({
  accountType: z.enum(['REAL', 'DEMO']).optional(),
  emailVerified: z.enum(['true', 'false']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

/**
 * Check if user is admin
 */
function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * GET /api/admin/users
 * List all users (admin only)
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

    // Check admin role
    if (!isAdmin(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Access denied. Admin role required.',
        error: 'FORBIDDEN',
      }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const validation = querySchema.safeParse({
      accountType: searchParams.get('accountType'),
      emailVerified: searchParams.get('emailVerified'),
      isActive: searchParams.get('isActive'),
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

    const { accountType, emailVerified, isActive, limit, offset } = validation.data;
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;

    // Build where clause
    const where: any = {};

    if (accountType) {
      where.accountType = accountType;
    }

    if (emailVerified) {
      where.emailVerified = emailVerified === 'true';
    }

    if (isActive) {
      where.isActive = isActive === 'true';
    }

    // Get users with related data
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          emailVerifiedAt: true,
          role: true,
          accountType: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              wallets: true,
              deposits: true,
              transactions: true,
              balances: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limitNum,
        skip: offsetNum,
      }),
      prisma.user.count({ where }),
    ]);

    // Get balance summaries for each user
    const usersWithBalances = await Promise.all(
      users.map(async (user) => {
        const balances = await prisma.balance.findMany({
          where: { userId: user.id },
        });

        const totalBalanceUsd = balances.reduce(
          (sum, b) => sum + b.balanceUsd.toNumber(),
          0
        );

        return {
          ...user,
          totalBalanceUsd,
        };
      })
    );

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        adminId: decoded.userId,
        action: 'admin_view_users',
        entity: 'user',
        metadata: {
          filters: { accountType, emailVerified, isActive },
          resultCount: users.length,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      users: usersWithBalances,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < totalCount,
      },
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
