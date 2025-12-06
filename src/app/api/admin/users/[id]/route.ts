// =============================================================================
// ADMIN API - User Details
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth-utils';

/**
 * Check if user is admin
 */
function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * GET /api/admin/users/[id]
 * Get detailed user information (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id;

    // Get user with all related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: {
          orderBy: { connectedAt: 'desc' },
        },
        deposits: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        balances: true,
        profitRecords: {
          orderBy: { calculatedAt: 'desc' },
          take: 10,
        },
        profitSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      }, { status: 404 });
    }

    // Calculate statistics
    const totalBalanceUsd = user.balances.reduce(
      (sum, b) => sum + b.balanceUsd.toNumber(),
      0
    );

    const totalDeposited = user.balances.reduce(
      (sum, b) => sum + b.totalDeposited.toNumber(),
      0
    );

    const totalProfits = user.balances.reduce(
      (sum, b) => sum + b.totalProfits.toNumber(),
      0
    );

    // Get simulation adjustments if demo account
    let simulationAdjustments = [];
    if (user.accountType === 'DEMO') {
      simulationAdjustments = await prisma.simulationAdjustment.findMany({
        where: { userId: user.id },
        orderBy: { appliedAt: 'desc' },
      });
    }

    // Get recent audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Format response (exclude password)
    const { password, ...userWithoutPassword } = user;

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        adminId: decoded.userId,
        action: 'admin_view_user_details',
        entity: 'user',
        entityId: userId,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        statistics: {
          totalBalanceUsd,
          totalDeposited,
          totalProfits,
          profitPercentage: totalDeposited > 0 
            ? ((totalProfits / totalDeposited) * 100).toFixed(2)
            : '0.00',
        },
        simulationAdjustments,
        recentAuditLogs: auditLogs,
      },
    });

  } catch (error) {
    console.error('Admin user details fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch user details',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
