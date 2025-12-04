// ============================================================================
// PROFIT SETTINGS API - Get and update profit settings
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profitSettings, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { ProfitSettingsResponse, ProfitSettingsUpdateRequest } from '@/types/trading';

/**
 * GET /api/profits/settings
 * Get profit settings for user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json<ProfitSettingsResponse>(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Get settings
    const settings = await db
      .select()
      .from(profitSettings)
      .where(eq(profitSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      // Create default settings
      const now = new Date().toISOString();
      const newSettings = await db
        .insert(profitSettings)
        .values({
          userId,
          dailyProfitRate: 0.02,
          tradingProfitRate: 0.05,
          compoundingEnabled: false,
          autoApplyProfits: true,
          minBalanceForProfits: '0.01',
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return NextResponse.json<ProfitSettingsResponse>({
        success: true,
        settings: {
          dailyProfitRate: newSettings[0].dailyProfitRate,
          tradingProfitRate: newSettings[0].tradingProfitRate,
          compoundingEnabled: Boolean(newSettings[0].compoundingEnabled),
          autoApplyProfits: Boolean(newSettings[0].autoApplyProfits),
          minBalanceForProfits: newSettings[0].minBalanceForProfits,
          lastProfitCalculation: newSettings[0].lastProfitCalculation || undefined,
        },
        message: 'Default settings created',
      });
    }

    return NextResponse.json<ProfitSettingsResponse>({
      success: true,
      settings: {
        dailyProfitRate: settings[0].dailyProfitRate,
        tradingProfitRate: settings[0].tradingProfitRate,
        compoundingEnabled: Boolean(settings[0].compoundingEnabled),
        autoApplyProfits: Boolean(settings[0].autoApplyProfits),
        minBalanceForProfits: settings[0].minBalanceForProfits,
        lastProfitCalculation: settings[0].lastProfitCalculation || undefined,
      },
      message: 'Settings retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching profit settings:', error);
    return NextResponse.json<ProfitSettingsResponse>(
      {
        success: false,
        message: 'Failed to fetch settings',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profits/settings
 * Update profit settings for user
 */
export async function PUT(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json<ProfitSettingsResponse>(
        {
          success: false,
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
      return NextResponse.json<ProfitSettingsResponse>(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body: ProfitSettingsUpdateRequest = await request.json();

    // Validate rates
    if (body.dailyProfitRate !== undefined) {
      if (body.dailyProfitRate < 0 || body.dailyProfitRate > 1) {
        return NextResponse.json<ProfitSettingsResponse>(
          {
            success: false,
            message: 'Daily profit rate must be between 0 and 1 (0% to 100%)',
          },
          { status: 400 }
        );
      }
    }

    if (body.tradingProfitRate !== undefined) {
      if (body.tradingProfitRate < 0 || body.tradingProfitRate > 1) {
        return NextResponse.json<ProfitSettingsResponse>(
          {
            success: false,
            message: 'Trading profit rate must be between 0 and 1 (0% to 100%)',
          },
          { status: 400 }
        );
      }
    }

    if (body.minBalanceForProfits !== undefined) {
      const minBalance = parseFloat(body.minBalanceForProfits);
      if (isNaN(minBalance) || minBalance < 0) {
        return NextResponse.json<ProfitSettingsResponse>(
          {
            success: false,
            message: 'Minimum balance must be a positive number',
          },
          { status: 400 }
        );
      }
    }

    // Get existing settings
    const existing = await db
      .select()
      .from(profitSettings)
      .where(eq(profitSettings.userId, userId))
      .limit(1);

    const now = new Date().toISOString();

    if (existing.length === 0) {
      // Create new settings
      const newSettings = await db
        .insert(profitSettings)
        .values({
          userId,
          dailyProfitRate: body.dailyProfitRate ?? 0.02,
          tradingProfitRate: body.tradingProfitRate ?? 0.05,
          compoundingEnabled: body.compoundingEnabled ?? false,
          autoApplyProfits: body.autoApplyProfits ?? true,
          minBalanceForProfits: body.minBalanceForProfits ?? '0.01',
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return NextResponse.json<ProfitSettingsResponse>({
        success: true,
        settings: {
          dailyProfitRate: newSettings[0].dailyProfitRate,
          tradingProfitRate: newSettings[0].tradingProfitRate,
          compoundingEnabled: Boolean(newSettings[0].compoundingEnabled),
          autoApplyProfits: Boolean(newSettings[0].autoApplyProfits),
          minBalanceForProfits: newSettings[0].minBalanceForProfits,
          lastProfitCalculation: newSettings[0].lastProfitCalculation || undefined,
        },
        message: 'Settings created successfully',
      });
    }

    // Update existing settings
    const updateData: any = { updatedAt: now };
    
    if (body.dailyProfitRate !== undefined) updateData.dailyProfitRate = body.dailyProfitRate;
    if (body.tradingProfitRate !== undefined) updateData.tradingProfitRate = body.tradingProfitRate;
    if (body.compoundingEnabled !== undefined) updateData.compoundingEnabled = body.compoundingEnabled;
    if (body.autoApplyProfits !== undefined) updateData.autoApplyProfits = body.autoApplyProfits;
    if (body.minBalanceForProfits !== undefined) updateData.minBalanceForProfits = body.minBalanceForProfits;

    const updated = await db
      .update(profitSettings)
      .set(updateData)
      .where(eq(profitSettings.userId, userId))
      .returning();

    return NextResponse.json<ProfitSettingsResponse>({
      success: true,
      settings: {
        dailyProfitRate: updated[0].dailyProfitRate,
        tradingProfitRate: updated[0].tradingProfitRate,
        compoundingEnabled: Boolean(updated[0].compoundingEnabled),
        autoApplyProfits: Boolean(updated[0].autoApplyProfits),
        minBalanceForProfits: updated[0].minBalanceForProfits,
        lastProfitCalculation: updated[0].lastProfitCalculation || undefined,
      },
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating profit settings:', error);
    return NextResponse.json<ProfitSettingsResponse>(
      {
        success: false,
        message: 'Failed to update settings',
      },
      { status: 500 }
    );
  }
}
