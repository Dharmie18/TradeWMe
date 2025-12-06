// =============================================================================
// ADMIN API - All Wallets
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth-utils';

function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * GET /api/admin/wallets
 * List all connected wallets with user info and deposits (admin only)
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
    
    if (!decoded || !isAdmin(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Access denied. Admin role required.',
        error: 'FORBIDDEN',
      }, { status: 403 });
    }

    // Get all wallets with user and deposit info
    const wallets = await prisma.wallet.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            accountType: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        deposits: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            deposits: true,
          },
        },
      },
      orderBy: {
        connectedAt: 'desc',
      },
    });

    // Calculate statistics
    const stats = {
      totalWallets: wallets.length,
      activeWallets: wallets.filter(w => w.isActive).length,
      totalDeposits: wallets.reduce((sum, w) => sum + w._count.deposits, 0),
      byChain: {
        ethereum: wallets.filter(w => w.chain === 'ethereum').length,
        bsc: wallets.filter(w => w.chain === 'bsc').length,
        polygon: wallets.filter(w => w.chain === 'polygon').length,
      },
    };

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        adminId: decoded.userId,
        action: 'admin_view_wallets',
        entity: 'wallet',
        metadata: {
          totalWallets: wallets.length,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      wallets: wallets.map(wallet => ({
        ...wallet,
        deposits: wallet.deposits.map(d => ({
          ...d,
          amount: d.amount.toString(),
          amountUsd: d.amountUsd.toNumber(),
        })),
      })),
      stats,
    });

  } catch (error) {
    console.error('Admin wallets fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch wallets',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
