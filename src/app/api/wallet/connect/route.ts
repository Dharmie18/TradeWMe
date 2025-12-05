import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/auth-utils';
import { z } from 'zod';

const prisma = new PrismaClient();

const connectWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  chain: z.enum(['ethereum', 'bsc', 'polygon']),
  walletType: z.enum(['metamask', 'walletconnect', 'coinbase']),
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
    const validation = connectWalletSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        error: validation.error.errors[0].message,
      }, { status: 400 });
    }

    const { address, chain, walletType } = validation.data;

    // Check if wallet already connected to another user
    const existingWallet = await prisma.wallet.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (existingWallet && existingWallet.userId !== decoded.userId) {
      return NextResponse.json({
        success: false,
        message: 'This wallet is already connected to another account',
        error: 'WALLET_IN_USE',
      }, { status: 409 });
    }

    // Create or update wallet
    const wallet = await prisma.wallet.upsert({
      where: { address: address.toLowerCase() },
      update: {
        isActive: true,
        lastUsedAt: new Date(),
      },
      create: {
        userId: decoded.userId,
        address: address.toLowerCase(),
        chain,
        walletType,
        initialBalance: 0, // CRITICAL: Always 0 on connect
      },
    });

    // Create initial balance record (0 for all currencies)
    const currency = chain === 'ethereum' ? 'ETH' : chain === 'bsc' ? 'BNB' : 'MATIC';
    
    await prisma.balance.upsert({
      where: {
        userId_currency: {
          userId: decoded.userId,
          currency,
        },
      },
      update: {},
      create: {
        userId: decoded.userId,
        currency,
        balance: 0, // CRITICAL: Balance is 0 until deposit
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'wallet_connect',
        entity: 'wallet',
        entityId: wallet.id,
        newData: {
          address: wallet.address,
          chain: wallet.chain,
          walletType: wallet.walletType,
          initialBalance: 0,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Wallet connected successfully. Balance is 0 until you make a deposit.',
      wallet: {
        id: wallet.id,
        address: wallet.address,
        chain: wallet.chain,
        walletType: wallet.walletType,
        initialBalance: 0,
        connectedAt: wallet.connectedAt,
      },
    });

  } catch (error) {
    console.error('Wallet connect error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect wallet',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
