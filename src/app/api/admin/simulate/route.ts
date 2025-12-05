// =============================================================================
// ADMIN API - Simulation Mode (DEMO ACCOUNTS ONLY)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/auth-utils';
import { z } from 'zod';

const prisma = new PrismaClient();

const simulationSchema = z.object({
  userId: z.string(),
  adjustmentType: z.enum(['profit_multiplier', 'balance_adjustment']),
  multiplier: z.number().optional(),
  amount: z.number().optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  expiresAt: z.string().optional(),
});

/**
 * Check if user is admin
 */
function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * POST /api/admin/simulate
 * Enable simulation mode for DEMO accounts only (admin only)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = simulationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        error: validation.error.errors[0].message,
      }, { status: 400 });
    }

    const { userId, adjustmentType, multiplier, amount, reason, expiresAt } = validation.data;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      }, { status: 404 });
    }

    // CRITICAL: Only allow simulation for DEMO accounts
    if (targetUser.accountType !== 'DEMO') {
      return NextResponse.json({
        success: false,
        message: 'Simulation mode can only be enabled for DEMO accounts. This is a REAL account.',
        error: 'REAL_ACCOUNT_SIMULATION_FORBIDDEN',
      }, { status: 403 });
    }

    // Validate adjustment type requirements
    if (adjustmentType === 'profit_multiplier' && !multiplier) {
      return NextResponse.json({
        success: false,
        message: 'Multiplier is required for profit_multiplier adjustment',
        error: 'MISSING_MULTIPLIER',
      }, { status: 400 });
    }

    if (adjustmentType === 'balance_adjustment' && !amount) {
      return NextResponse.json({
        success: false,
        message: 'Amount is required for balance_adjustment',
        error: 'MISSING_AMOUNT',
      }, { status: 400 });
    }

    // Get previous value if exists
    const previousAdjustment = await prisma.simulationAdjustment.findFirst({
      where: {
        userId,
        adjustmentType,
        isActive: true,
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    // Deactivate previous adjustment
    if (previousAdjustment) {
      await prisma.simulationAdjustment.update({
        where: { id: previousAdjustment.id },
        data: { isActive: false },
      });
    }

    // Create simulation adjustment
    const adjustment = await prisma.simulationAdjustment.create({
      data: {
        userId,
        adminId: decoded.userId,
        accountType: targetUser.accountType,
        adjustmentType,
        previousValue: previousAdjustment?.newValue,
        newValue: amount || multiplier || 0,
        multiplier: multiplier || null,
        reason,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Log admin action
    await prisma.auditLog.create({
      data: {
        userId: targetUser.id,
        adminId: decoded.userId,
        action: 'simulation_enabled',
        entity: 'simulation',
        entityId: adjustment.id,
        previousData: previousAdjustment ? {
          adjustmentType: previousAdjustment.adjustmentType,
          value: previousAdjustment.newValue.toString(),
        } : null,
        newData: {
          adjustmentType,
          multiplier,
          amount,
          reason,
          expiresAt,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Simulation mode enabled for DEMO account',
      adjustment: {
        id: adjustment.id,
        userId: adjustment.userId,
        adjustmentType: adjustment.adjustmentType,
        multiplier: adjustment.multiplier?.toString(),
        amount: adjustment.newValue.toString(),
        reason: adjustment.reason,
        isActive: adjustment.isActive,
        appliedAt: adjustment.appliedAt,
        expiresAt: adjustment.expiresAt,
      },
      warning: 'This adjustment is visible to the user and logged in audit trail',
    });

  } catch (error) {
    console.error('Simulation enable error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to enable simulation mode',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/simulate?userId=xxx
 * Get simulation adjustments for a user
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
    
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token',
      }, { status: 401 });
    }

    // Check admin role
    if (!isAdmin(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Access denied. Admin role required.',
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'userId is required',
      }, { status: 400 });
    }

    // Get all simulation adjustments for user
    const adjustments = await prisma.simulationAdjustment.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      adjustments: adjustments.map(adj => ({
        id: adj.id,
        adjustmentType: adj.adjustmentType,
        previousValue: adj.previousValue?.toString(),
        newValue: adj.newValue.toString(),
        multiplier: adj.multiplier?.toString(),
        reason: adj.reason,
        isActive: adj.isActive,
        appliedAt: adj.appliedAt,
        expiresAt: adj.expiresAt,
      })),
    });

  } catch (error) {
    console.error('Simulation fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch simulation adjustments',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
