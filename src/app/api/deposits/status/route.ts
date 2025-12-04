// ============================================================================
// DEPOSIT STATUS API - Check deposit confirmation status
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits, userBalances } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  verifyTransaction,
  hasEnoughConfirmations,
  calculateUsdValue,
} from '@/lib/blockchain';
import type { DepositStatusResponse } from '@/types/trading';

/**
 * GET /api/deposits/status?txHash=0x...
 * Check the status of a deposit and update if needed
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json<DepositStatusResponse>(
        {
          success: false,
          message: 'Unauthorized',
          error: 'NO_AUTH',
        },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');

    // Get transaction hash from query
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');

    if (!txHash) {
      return NextResponse.json<DepositStatusResponse>(
        {
          success: false,
          message: 'Transaction hash is required',
          error: 'MISSING_TX_HASH',
        },
        { status: 400 }
      );
    }

    // Get deposit from database
    const deposit = await db
      .select()
      .from(deposits)
      .where(
        and(
          eq(deposits.userId, userId),
          eq(deposits.txHash, txHash)
        )
      )
      .limit(1);

    if (deposit.length === 0) {
      return NextResponse.json<DepositStatusResponse>(
        {
          success: false,
          message: 'Deposit not found',
          error: 'DEPOSIT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const currentDeposit = deposit[0];

    // If already confirmed, return current status
    if (currentDeposit.status === 'confirmed') {
      return NextResponse.json<DepositStatusResponse>({
        success: true,
        deposit: {
          id: currentDeposit.id,
          txHash: currentDeposit.txHash,
          amount: currentDeposit.amount,
          currency: currentDeposit.currency as any,
          amountUsd: currentDeposit.amountUsd,
          status: 'confirmed',
          confirmations: currentDeposit.confirmations,
          blockNumber: currentDeposit.blockNumber || undefined,
          depositedAt: currentDeposit.depositedAt,
          confirmedAt: currentDeposit.confirmedAt || undefined,
        },
        message: 'Deposit is confirmed',
      });
    }

    // If pending, check blockchain for updates
    if (currentDeposit.status === 'pending') {
      const verification = await verifyTransaction(
        txHash,
        currentDeposit.network as any
      );

      if (!verification.success || !verification.transaction) {
        return NextResponse.json<DepositStatusResponse>({
          success: true,
          deposit: {
            id: currentDeposit.id,
            txHash: currentDeposit.txHash,
            amount: currentDeposit.amount,
            currency: currentDeposit.currency as any,
            amountUsd: currentDeposit.amountUsd,
            status: 'pending',
            confirmations: currentDeposit.confirmations,
            depositedAt: currentDeposit.depositedAt,
          },
          message: 'Deposit is still pending',
        });
      }

      const tx = verification.transaction;
      const isConfirmed = hasEnoughConfirmations(
        tx.confirmations,
        currentDeposit.network as any
      );

      // Update deposit with new confirmation count
      const now = new Date().toISOString();
      const newStatus = tx.status === 'failed' ? 'failed' : isConfirmed ? 'confirmed' : 'pending';

      const updated = await db
        .update(deposits)
        .set({
          confirmations: tx.confirmations,
          status: newStatus,
          confirmedAt: isConfirmed ? now : null,
          updatedAt: now,
        })
        .where(eq(deposits.id, currentDeposit.id))
        .returning();

      // If newly confirmed, update user balance
      if (newStatus === 'confirmed' && currentDeposit.status === 'pending') {
        await updateUserBalance(
          userId,
          currentDeposit.currency,
          currentDeposit.amount,
          'add'
        );
      }

      return NextResponse.json<DepositStatusResponse>({
        success: true,
        deposit: {
          id: updated[0].id,
          txHash: updated[0].txHash,
          amount: updated[0].amount,
          currency: updated[0].currency as any,
          amountUsd: updated[0].amountUsd,
          status: updated[0].status as any,
          confirmations: updated[0].confirmations,
          blockNumber: updated[0].blockNumber || undefined,
          depositedAt: updated[0].depositedAt,
          confirmedAt: updated[0].confirmedAt || undefined,
        },
        message: newStatus === 'confirmed' 
          ? 'Deposit confirmed and credited to your account!' 
          : `Deposit pending (${tx.confirmations} confirmations)`,
      });
    }

    // Failed status
    return NextResponse.json<DepositStatusResponse>({
      success: true,
      deposit: {
        id: currentDeposit.id,
        txHash: currentDeposit.txHash,
        amount: currentDeposit.amount,
        currency: currentDeposit.currency as any,
        amountUsd: currentDeposit.amountUsd,
        status: 'failed',
        confirmations: currentDeposit.confirmations,
        depositedAt: currentDeposit.depositedAt,
      },
      message: 'Deposit transaction failed',
    });
  } catch (error) {
    console.error('Error checking deposit status:', error);
    return NextResponse.json<DepositStatusResponse>(
      {
        success: false,
        message: 'Failed to check deposit status',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to update user balance
 */
async function updateUserBalance(
  userId: string,
  currency: string,
  amount: string,
  operation: 'add' | 'subtract'
) {
  const now = new Date().toISOString();
  
  // Get existing balance
  const existing = await db
    .select()
    .from(userBalances)
    .where(
      and(
        eq(userBalances.userId, userId),
        eq(userBalances.currency, currency)
      )
    )
    .limit(1);

  const numericAmount = parseFloat(amount);
  const amountUsd = await calculateUsdValue(amount, currency);

  if (existing.length === 0) {
    // Create new balance
    await db.insert(userBalances).values({
      userId,
      currency,
      balance: operation === 'add' ? amount : '0',
      lockedBalance: '0',
      totalDeposited: operation === 'add' ? amount : '0',
      totalWithdrawn: '0',
      totalProfits: '0',
      balanceUsd: operation === 'add' ? amountUsd : 0,
      lastUpdated: now,
      createdAt: now,
    });
  } else {
    // Update existing balance
    const currentBalance = parseFloat(existing[0].balance);
    const currentDeposited = parseFloat(existing[0].totalDeposited);
    
    const newBalance = operation === 'add' 
      ? currentBalance + numericAmount 
      : currentBalance - numericAmount;
    
    const newDeposited = operation === 'add'
      ? currentDeposited + numericAmount
      : currentDeposited;

    const newBalanceUsd = await calculateUsdValue(newBalance.toString(), currency);

    await db
      .update(userBalances)
      .set({
        balance: newBalance.toString(),
        totalDeposited: newDeposited.toString(),
        balanceUsd: newBalanceUsd,
        lastUpdated: now,
      })
      .where(eq(userBalances.id, existing[0].id));
  }
}
