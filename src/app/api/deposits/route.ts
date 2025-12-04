// ============================================================================
// DEPOSITS API - Handle user deposits and verification
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deposits, userWallets, userBalances, user } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  verifyTransaction,
  isValidDepositAddress,
  hasEnoughConfirmations,
  calculateUsdValue,
  isValidTxHash,
  PLATFORM_DEPOSIT_ADDRESS,
} from '@/lib/blockchain';
import type {
  DepositRequest,
  DepositResponse,
  DepositHistoryResponse,
} from '@/types/trading';

/**
 * POST /api/deposits
 * Submit a new deposit transaction for verification
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json<DepositResponse>(
        {
          success: false,
          message: 'Unauthorized - Please login first',
          error: 'NO_AUTH',
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
      return NextResponse.json<DepositResponse>(
        {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body: DepositRequest = await request.json();
    const { txHash, fromAddress, amount, currency, network } = body;

    // Validate inputs
    if (!txHash || !isValidTxHash(txHash)) {
      return NextResponse.json<DepositResponse>(
        {
          success: false,
          message: 'Invalid transaction hash format',
          error: 'INVALID_TX_HASH',
        },
        { status: 400 }
      );
    }

    if (!fromAddress || !amount || !currency || !network) {
      return NextResponse.json<DepositResponse>(
        {
          success: false,
          message: 'Missing required fields',
          error: 'MISSING_FIELDS',
        },
        { status: 400 }
      );
    }

    // Check if deposit already exists
    const existingDeposit = await db
      .select()
      .from(deposits)
      .where(eq(deposits.txHash, txHash))
      .limit(1);

    if (existingDeposit.length > 0) {
      return NextResponse.json<DepositResponse>(
        {
          success: false,
          message: 'This transaction has already been submitted',
          error: 'DUPLICATE_DEPOSIT',
        },
        { status: 409 }
      );
    }

    // Verify transaction on blockchain
    const verification = await verifyTransaction(txHash, network);

    if (!verification.success || !verification.transaction) {
      return NextResponse.json<DepositResponse>(
        {
          success: false,
          message: 'Transaction not found on blockchain',
          error: 'TX_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const tx = verification.transaction;

    // Verify transaction is sent to platform address
    if (!isValidDepositAddress(tx.to)) {
      return NextResponse.json<DepositResponse>(
        {
          success: false,
          message: `Invalid deposit address. Please send to: ${PLATFORM_DEPOSIT_ADDRESS}`,
          error: 'INVALID_DEPOSIT_ADDRESS',
        },
        { status: 400 }
      );
    }

    // Verify from address matches
    if (tx.from.toLowerCase() !== fromAddress.toLowerCase()) {
      return NextResponse.json<DepositResponse>(
        {
          success: false,
          message: 'From address does not match transaction',
          error: 'ADDRESS_MISMATCH',
        },
        { status: 400 }
      );
    }

    // Verify amount matches (allow small difference for gas)
    const txAmount = parseFloat(tx.value);
    const requestedAmount = parseFloat(amount);
    const difference = Math.abs(txAmount - requestedAmount);
    
    if (difference > 0.0001) {
      return NextResponse.json<DepositResponse>(
        {
          success: false,
          message: `Amount mismatch. Transaction: ${txAmount}, Requested: ${requestedAmount}`,
          error: 'AMOUNT_MISMATCH',
        },
        { status: 400 }
      );
    }

    // Get or create wallet
    let wallet = await db
      .select()
      .from(userWallets)
      .where(
        and(
          eq(userWallets.userId, userId),
          eq(userWallets.walletAddress, fromAddress.toLowerCase())
        )
      )
      .limit(1);

    if (wallet.length === 0) {
      // Auto-create wallet if not exists
      const now = new Date().toISOString();
      const newWallet = await db
        .insert(userWallets)
        .values({
          userId,
          walletAddress: fromAddress.toLowerCase(),
          walletType: 'metamask', // Default, can be updated later
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      
      wallet = newWallet;
    }

    // Calculate USD value
    const amountUsd = await calculateUsdValue(tx.value, currency);

    // Determine status based on confirmations
    const isConfirmed = hasEnoughConfirmations(tx.confirmations, network);
    const status = tx.status === 'failed' ? 'failed' : isConfirmed ? 'confirmed' : 'pending';

    // Create deposit record
    const now = new Date().toISOString();
    const newDeposit = await db
      .insert(deposits)
      .values({
        userId,
        walletId: wallet[0].id,
        txHash,
        fromAddress: tx.from.toLowerCase(),
        toAddress: tx.to.toLowerCase(),
        amount: tx.value,
        currency,
        amountUsd,
        status,
        confirmations: tx.confirmations,
        blockNumber: tx.blockNumber,
        gasUsed: tx.gasUsed,
        gasPriceGwei: (parseFloat(tx.gasPrice) / 1e9).toString(),
        network,
        depositedAt: new Date(tx.timestamp * 1000).toISOString(),
        confirmedAt: isConfirmed ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // If confirmed, update user balance
    if (status === 'confirmed') {
      await updateUserBalance(userId, currency, tx.value, 'add');
    }

    return NextResponse.json<DepositResponse>({
      success: true,
      deposit: {
        id: newDeposit[0].id,
        txHash: newDeposit[0].txHash,
        amount: newDeposit[0].amount,
        currency: newDeposit[0].currency as any,
        amountUsd: newDeposit[0].amountUsd,
        status: newDeposit[0].status as any,
        confirmations: newDeposit[0].confirmations,
        depositedAt: newDeposit[0].depositedAt,
      },
      message: status === 'confirmed' 
        ? 'Deposit confirmed and credited to your account' 
        : 'Deposit submitted, waiting for confirmations',
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    return NextResponse.json<DepositResponse>(
      {
        success: false,
        message: 'Failed to process deposit',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/deposits
 * Get deposit history for user
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const currency = searchParams.get('currency');

    // Build query
    let query = db
      .select()
      .from(deposits)
      .where(eq(deposits.userId, userId))
      .orderBy(desc(deposits.depositedAt))
      .limit(limit)
      .offset(offset);

    // Apply filters
    if (status) {
      query = query.where(and(eq(deposits.userId, userId), eq(deposits.status, status))) as any;
    }
    if (currency) {
      query = query.where(and(eq(deposits.userId, userId), eq(deposits.currency, currency))) as any;
    }

    const userDeposits = await query;

    // Get total count
    const totalResult = await db
      .select()
      .from(deposits)
      .where(eq(deposits.userId, userId));

    return NextResponse.json<DepositHistoryResponse>({
      success: true,
      deposits: userDeposits.map(d => ({
        id: d.id,
        txHash: d.txHash,
        amount: d.amount,
        currency: d.currency as any,
        amountUsd: d.amountUsd,
        status: d.status as any,
        confirmations: d.confirmations,
        network: d.network as any,
        depositedAt: d.depositedAt,
        confirmedAt: d.confirmedAt || undefined,
      })),
      total: totalResult.length,
      message: 'Deposit history retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch deposits', deposits: [], total: 0 },
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
