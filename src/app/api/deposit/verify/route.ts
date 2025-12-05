// =============================================================================
// DEPOSIT VERIFICATION API - Real Blockchain Transaction Verification
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyJWT } from '@/lib/auth-utils';
import {
  verifyTransaction,
  hasEnoughConfirmations,
  getRequiredConfirmations,
  isValidAddress,
  isValidTxHash,
  calculateUsdValue,
  type NetworkType,
} from '@/lib/blockchain';

const prisma = new PrismaClient();

const depositSchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  chain: z.enum(['ethereum', 'ethereum-testnet', 'bsc', 'polygon']),
  expectedAmount: z.string().optional(),
});

/**
 * Update user balance after confirmed deposit
 */
async function updateUserBalance(
  userId: string,
  currency: string,
  amount: string,
  amountUsd: number
) {
  const numericAmount = parseFloat(amount);

  const balance = await prisma.balance.upsert({
    where: {
      userId_currency: {
        userId,
        currency,
      },
    },
    update: {
      balance: {
        increment: numericAmount,
      },
      balanceUsd: {
        increment: amountUsd,
      },
      totalDeposited: {
        increment: numericAmount,
      },
      lastUpdated: new Date(),
    },
    create: {
      userId,
      currency,
      balance: numericAmount,
      balanceUsd: amountUsd,
      totalDeposited: numericAmount,
      lastUpdated: new Date(),
    },
  });

  return balance;
}

/**
 * POST /api/deposit/verify
 * Verify blockchain transaction and create deposit record
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

    const body = await request.json();
    const validation = depositSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        error: validation.error.errors[0].message,
      }, { status: 400 });
    }

    const { txHash, chain, expectedAmount } = validation.data;

    // Check if deposit already exists
    const existingDeposit = await prisma.deposit.findUnique({
      where: { txHash },
    });

    if (existingDeposit) {
      return NextResponse.json({
        success: true,
        message: 'This transaction has already been submitted',
        error: 'DUPLICATE_DEPOSIT',
        deposit: {
          id: existingDeposit.id,
          status: existingDeposit.status,
          confirmations: existingDeposit.confirmations,
          confirmedAt: existingDeposit.confirmedAt,
        },
      }, { status: 409 });
    }

    // Get user's wallet for this chain
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: decoded.userId,
        chain,
        isActive: true,
      },
    });

    if (!wallet) {
      return NextResponse.json({
        success: false,
        message: `No ${chain} wallet connected. Please connect a wallet first.`,
        error: 'NO_WALLET',
      }, { status: 400 });
    }

    // Verify transaction on blockchain
    const verification = await verifyTransaction(txHash, chain as NetworkType);

    if (!verification.success) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found on blockchain',
        error: 'TX_NOT_FOUND',
      }, { status: 404 });
    }

    const tx = verification.transaction!;

    // Verify transaction succeeded
    if (tx.status === 'failed') {
      return NextResponse.json({
        success: false,
        message: 'Transaction failed on blockchain',
        error: 'TX_FAILED',
      }, { status: 400 });
    }

    // Verify platform deposit address
    const platformAddress = process.env.NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS;
    if (tx.to.toLowerCase() !== platformAddress?.toLowerCase()) {
      return NextResponse.json({
        success: false,
        message: `Invalid deposit address. Please send to: ${platformAddress}`,
        error: 'INVALID_DEPOSIT_ADDRESS',
      }, { status: 400 });
    }

    // Verify from address matches user's wallet
    if (tx.from.toLowerCase() !== wallet.address.toLowerCase()) {
      return NextResponse.json({
        success: false,
        message: 'Transaction sender does not match your connected wallet',
        error: 'ADDRESS_MISMATCH',
      }, { status: 400 });
    }

    // Verify amount if provided
    if (expectedAmount) {
      const expected = parseFloat(expectedAmount);
      const txAmount = parseFloat(tx.value);
      const difference = Math.abs(txAmount - expected);
      
      if (difference > 0.001) {
        return NextResponse.json({
          success: false,
          message: `Amount mismatch. Expected ${expected}, Got: ${txAmount}`,
          error: 'AMOUNT_MISMATCH',
        }, { status: 400 });
      }
    }

    // Determine currency based on chain
    const currency = chain === 'ethereum' || chain === 'ethereum-testnet' 
      ? 'ETH' 
      : chain === 'bsc' 
      ? 'BNB' 
      : 'MATIC';

    // Calculate USD value
    const amountUsd = await calculateUsdValue(tx.value, currency);

    // Determine status based on confirmations
    const requiredConfirmations = getRequiredConfirmations(chain as NetworkType);
    const isConfirmed = hasEnoughConfirmations(tx.confirmations, chain as NetworkType);
    const status = tx.confirmations === 0 
      ? 'PENDING' 
      : isConfirmed 
      ? 'CONFIRMED' 
      : 'CONFIRMING';

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        userId: decoded.userId,
        walletId: wallet.id,
        txHash,
        fromAddress: tx.from.toLowerCase(),
        toAddress: tx.to.toLowerCase(),
        amount: tx.value,
        currency,
        chain,
        amountUsd,
        status,
        confirmations: tx.confirmations,
        requiredConfirmations,
        blockNumber: BigInt(tx.blockNumber),
        blockTimestamp: tx.blockTimestamp,
        gasUsed: tx.gasUsed,
        gasPriceGwei: (parseFloat(tx.gasPrice) / 1e9).toString(),
        verifiedAt: new Date(),
        confirmedAt: isConfirmed ? new Date() : null,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: isConfirmed ? 'deposit_confirmed' : 'deposit_submitted',
        entity: 'deposit',
        entityId: deposit.id,
        newData: {
          txHash,
          amount: tx.value,
          currency,
          amountUsd,
          status,
          confirmations: tx.confirmations,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    // If confirmed, update balance
    if (isConfirmed) {
      await updateUserBalance(decoded.userId, currency, tx.value, amountUsd);
    }

    return NextResponse.json({
      success: true,
      message: isConfirmed 
        ? 'Deposit confirmed and credited to your account!' 
        : `Deposit submitted. Waiting for confirmations (${tx.confirmations}/${requiredConfirmations})`,
      deposit: {
        id: deposit.id,
        txHash: deposit.txHash,
        amount: deposit.amount.toString(),
        currency: deposit.currency,
        amountUsd: deposit.amountUsd.toNumber(),
        status: deposit.status,
        confirmations: tx.confirmations,
        requiredConfirmations: deposit.requiredConfirmations,
        blockNumber: deposit.blockNumber?.toString(),
        verifiedAt: deposit.verifiedAt,
        confirmedAt: deposit.confirmedAt,
      },
    });

  } catch (error) {
    console.error('Deposit verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify deposit',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}


/**
 * GET /api/deposit/verify?txHash=0x...
 * Check deposit status and update confirmations
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

    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');

    if (!txHash) {
      return NextResponse.json({
        success: false,
        message: 'Transaction hash required',
      }, { status: 400 });
    }

    // Get deposit
    const deposit = await prisma.deposit.findUnique({
      where: { txHash },
    });

    if (!deposit) {
      return NextResponse.json({
        success: false,
        message: 'Deposit not found',
      }, { status: 404 });
    }

    if (deposit.userId !== decoded.userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    // If already confirmed, return current status
    if (deposit.status === 'CONFIRMED') {
      return NextResponse.json({
        success: true,
        deposit: {
          id: deposit.id,
          txHash: deposit.txHash,
          amount: deposit.amount.toString(),
          currency: deposit.currency,
          amountUsd: deposit.amountUsd.toNumber(),
          status: deposit.status,
          confirmations: deposit.confirmations,
          requiredConfirmations: deposit.requiredConfirmations,
          blockNumber: deposit.blockNumber?.toString(),
          verifiedAt: deposit.verifiedAt,
          confirmedAt: deposit.confirmedAt,
        },
      });
    }

    // Check blockchain for updated confirmations
    const verification = await verifyTransaction(
      txHash,
      deposit.chain as NetworkType
    );

    if (!verification.success || !verification.transaction) {
      return NextResponse.json({
        success: false,
        message: 'Failed to check transaction status',
      }, { status: 500 });
    }

    const tx = verification.transaction;
    const isConfirmed = hasEnoughConfirmations(
      tx.confirmations,
      deposit.chain as NetworkType
    );
    const status = tx.confirmations === 0 
      ? 'PENDING' 
      : isConfirmed 
      ? 'CONFIRMED' 
      : 'CONFIRMING';

    // Update deposit record
    const updatedDeposit = await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        confirmations: tx.confirmations,
        status,
        confirmedAt: isConfirmed && !deposit.confirmedAt ? new Date() : deposit.confirmedAt,
        updatedAt: new Date(),
      },
    });

    // If newly confirmed, update balance
    if (isConfirmed && deposit.status !== 'CONFIRMED') {
      await updateUserBalance(
        deposit.userId,
        deposit.currency,
        deposit.amount.toString(),
        deposit.amountUsd.toNumber()
      );

      // Log confirmation
      await prisma.auditLog.create({
        data: {
          userId: deposit.userId,
          action: 'deposit_confirmed',
          entity: 'deposit',
          entityId: deposit.id,
          previousData: {
            status: deposit.status,
            confirmations: deposit.confirmations,
          },
          newData: {
            status: 'CONFIRMED',
            confirmations: tx.confirmations,
            confirmedAt: new Date(),
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.ip,
          userAgent: request.headers.get('user-agent'),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: isConfirmed 
        ? 'Deposit confirmed and credited to your account!' 
        : `Waiting for confirmations (${tx.confirmations}/${updatedDeposit.requiredConfirmations})`,
      deposit: {
        id: updatedDeposit.id,
        txHash: updatedDeposit.txHash,
        amount: updatedDeposit.amount.toString(),
        currency: updatedDeposit.currency,
        amountUsd: updatedDeposit.amountUsd.toNumber(),
        status: updatedDeposit.status,
        confirmations: tx.confirmations,
        requiredConfirmations: updatedDeposit.requiredConfirmations,
        blockNumber: updatedDeposit.blockNumber?.toString(),
        verifiedAt: updatedDeposit.verifiedAt,
        confirmedAt: updatedDeposit.confirmedAt,
      },
    });

  } catch (error) {
    console.error('Deposit status check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check deposit status',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
