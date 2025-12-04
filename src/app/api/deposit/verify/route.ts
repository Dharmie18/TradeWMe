// =============================================================================
// DEPOSIT VERIFICATION API - Real Blockchain Verification
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/auth-utils';
import {
  verifyTransaction,
  hasEnoughConfirmations,
  calculateUsdValue,
  isValidTxHash,
  isValidAddress,
  getRequiredConfirmations,
  type NetworkType,
} from '@/lib/blockchain';
import { z } from 'zod';

const prisma = new PrismaClient();

const depositSchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  chain: z.enum(['ethereum', 'ethereum-testnet', 'bsc', 'polygon']),
  expectedAmount: z.string().optional(),
});

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
        success: false,
        message: 'This transaction has already been submitted',
        error: 'DUPLICATE_DEPOSIT',
        deposit: {
          id: existingDeposit.id,
          status: existingDeposit.status,
          confirmations: existingDeposit.confirmations,
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

    if (!verification.success || !verification.transaction) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found on blockchain',
        error: 'TX_NOT_FOUND',
      }, { status: 404 });
    }

    const tx = verification.transaction;

    // Verify transaction is not failed
    if (tx.status === 'failed') {
      return NextResponse.json({
        success: false,
        message: 'Transaction failed on blockchain',
        error: 'TX_FAILED',
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

    // Determine currency based on chain
    const currency = chain === 'ethereum' || chain === 'ethereum-testnet' ? 'ETH' :
      chain === 'bsc' ? 'BNB' : 'MATIC';

    // Calculate USD value
    const amountUsd = await calculateUsdValue(tx.value, currency);

    // Determine status based on confirmations
    const requiredConfirmations = getRequiredConfirmations(chain as NetworkType);
    const isConfirmed = hasEnoughConfirmations(tx.confirmations, chain as NetworkType);
    const status = isConfirmed ? 'CONFIRMED' : tx.confirmations > 0 ? 'CONFIRMING' : 'PENDING';

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
        amountUsd,
        chain,
        status,
        confirmations: tx.confirmations,
        requiredConfirmations,
        blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : null,
        blockTimestamp: tx.blockTimestamp,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice ? (parseFloat(tx.gasPrice.toString()) / 1e9).toString() : null,
        verifiedAt: new Date(),
        confirmedAt: isConfirmed ? new Date() : null,
      },
    });

    // If confirmed, update user balance
    if (isConfirmed) {
      await updateUserBalance(decoded.userId, currency, tx.value, amountUsd);
    }

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
          confirmations: tx.confirmations,
          status,
        },
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: isConfirmed ? 'Deposit confirmed and credited to your account!' :
        `Deposit submitted. Waiting for confirmations (${tx.confirmations}/${requiredConfirmations})`,
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
 * GET endpoint to check deposit status
 */
export async function GET(request: NextRequest) {
  try {
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

    if (!deposit || deposit.userId !== decoded.userId) {
      return NextResponse.json({
        success: false,
        message: 'Deposit not found',
      }, { status: 404 });
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
          confirmedAt: deposit.confirmedAt,
        },
      });
    }

    // Check blockchain for updates
    const verification = await verifyTransaction(
      txHash,
      deposit.chain as NetworkType
    );

    if (verification.success && verification.transaction) {
      const tx = verification.transaction;
      const isConfirmed = hasEnoughConfirmations(
        tx.confirmations,
        deposit.chain as NetworkType
      );

      // Update deposit
      const updatedDeposit = await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          confirmations: tx.confirmations,
          status: isConfirmed ? 'CONFIRMED' : 'CONFIRMING',
          confirmedAt: isConfirmed ? new Date() : null,
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
            userId: decoded.userId,
            action: 'deposit_confirmed',
            entity: 'deposit',
            entityId: deposit.id,
            newData: {
              confirmations: tx.confirmations,
              status: 'CONFIRMED',
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        deposit: {
          id: updatedDeposit.id,
          txHash: updatedDeposit.txHash,
          amount: updatedDeposit.amount.toString(),
          currency: updatedDeposit.currency,
          amountUsd: updatedDeposit.amountUsd.toNumber(),
          status: updatedDeposit.status,
          confirmations: updatedDeposit.confirmations,
          confirmedAt: updatedDeposit.confirmedAt,
        },
      });
    }

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
      },
    });
  } catch (error) {
    console.error('Deposit check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check deposit status',
    }, { status: 500 });
  }
}

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
      totalDeposited: {
        increment: numericAmount,
      },
      balanceUsd: {
        increment: amountUsd,
      },
      lastUpdated: new Date(),
    },
    create: {
      userId,
      currency,
      balance: numericAmount,
      totalDeposited: numericAmount,
      balanceUsd: amountUsd,
      lastUpdated: new Date(),
    },
  });

  return balance;
}