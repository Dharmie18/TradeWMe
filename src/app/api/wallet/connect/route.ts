// ============================================================================
// WALLET CONNECTION API - Connect/Disconnect wallet
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userWallets, user, profitSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { isValidAddress } from '@/lib/blockchain';
import type { WalletConnectionRequest, WalletConnectionResponse } from '@/types/trading';

/**
 * POST /api/wallet/connect
 * Connect a wallet to user account
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session (using better-auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json<WalletConnectionResponse>(
        {
          success: false,
          message: 'Unauthorized - Please login first',
          error: 'NO_AUTH',
        },
        { status: 401 }
      );
    }

    // Extract user ID from session token
    // In production, validate the token with better-auth
    const userId = authHeader.replace('Bearer ', '');

    // Validate user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json<WalletConnectionResponse>(
        {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body: WalletConnectionRequest = await request.json();
    const { walletAddress, walletType, signature, message } = body;

    // Validate wallet address
    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json<WalletConnectionResponse>(
        {
          success: false,
          message: 'Invalid wallet address format',
          error: 'INVALID_ADDRESS',
        },
        { status: 400 }
      );
    }

    // Validate wallet type
    const validWalletTypes = ['metamask', 'coinbase', 'walletconnect', 'trust', 'rainbow'];
    if (!walletType || !validWalletTypes.includes(walletType)) {
      return NextResponse.json<WalletConnectionResponse>(
        {
          success: false,
          message: 'Invalid wallet type',
          error: 'INVALID_WALLET_TYPE',
        },
        { status: 400 }
      );
    }

    // Optional: Verify signature if provided
    // This adds extra security by proving wallet ownership
    if (signature && message) {
      // TODO: Implement signature verification using viem
      // const isValid = await verifySignature(walletAddress, message, signature);
      // if (!isValid) {
      //   return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
      // }
    }

    // Check if wallet is already connected to another user
    const existingWallet = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.walletAddress, walletAddress.toLowerCase()))
      .limit(1);

    if (existingWallet.length > 0 && existingWallet[0].userId !== userId) {
      return NextResponse.json<WalletConnectionResponse>(
        {
          success: false,
          message: 'This wallet is already connected to another account',
          error: 'WALLET_ALREADY_CONNECTED',
        },
        { status: 409 }
      );
    }

    // If wallet already connected to this user, just update it
    if (existingWallet.length > 0 && existingWallet[0].userId === userId) {
      const updated = await db
        .update(userWallets)
        .set({
          isActive: true,
          walletType,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userWallets.id, existingWallet[0].id))
        .returning();

      return NextResponse.json<WalletConnectionResponse>({
        success: true,
        wallet: {
          id: updated[0].id,
          walletAddress: updated[0].walletAddress,
          walletType: updated[0].walletType as any,
          isActive: Boolean(updated[0].isActive),
          createdAt: updated[0].createdAt,
        },
        message: 'Wallet reconnected successfully',
      });
    }

    // Create new wallet connection
    const now = new Date().toISOString();
    const newWallet = await db
      .insert(userWallets)
      .values({
        userId,
        walletAddress: walletAddress.toLowerCase(),
        walletType,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Initialize profit settings for new user if not exists
    const existingSettings = await db
      .select()
      .from(profitSettings)
      .where(eq(profitSettings.userId, userId))
      .limit(1);

    if (existingSettings.length === 0) {
      await db.insert(profitSettings).values({
        userId,
        dailyProfitRate: 0.02, // 2% daily
        tradingProfitRate: 0.05, // 5% per trade
        compoundingEnabled: false,
        autoApplyProfits: true,
        minBalanceForProfits: '0.01',
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json<WalletConnectionResponse>({
      success: true,
      wallet: {
        id: newWallet[0].id,
        walletAddress: newWallet[0].walletAddress,
        walletType: newWallet[0].walletType as any,
        isActive: Boolean(newWallet[0].isActive),
        createdAt: newWallet[0].createdAt,
      },
      message: 'Wallet connected successfully',
    });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return NextResponse.json<WalletConnectionResponse>(
      {
        success: false,
        message: 'Failed to connect wallet',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wallet/connect
 * Disconnect a wallet from user account
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Parse request body
    const { walletAddress } = await request.json();

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, message: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Deactivate wallet
    const result = await db
      .update(userWallets)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(userWallets.userId, userId),
          eq(userWallets.walletAddress, walletAddress.toLowerCase())
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Wallet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to disconnect wallet' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/connect
 * Get connected wallets for user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Get all active wallets for user
    const wallets = await db
      .select()
      .from(userWallets)
      .where(
        and(
          eq(userWallets.userId, userId),
          eq(userWallets.isActive, true)
        )
      );

    return NextResponse.json({
      success: true,
      wallets: wallets.map(w => ({
        id: w.id,
        walletAddress: w.walletAddress,
        walletType: w.walletType,
        isActive: Boolean(w.isActive),
        createdAt: w.createdAt,
      })),
      message: 'Wallets retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wallets' },
      { status: 500 }
    );
  }
}
