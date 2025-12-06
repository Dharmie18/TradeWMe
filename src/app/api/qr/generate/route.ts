import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';
import { createHmac } from 'crypto';
import { verifyJWT } from '@/lib/auth-utils';
import { z } from 'zod';

// Use shared prisma instance

const qrSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chain: z.enum(['ethereum', 'bsc', 'polygon']),
  amount: z.string().optional(),
  currency: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const validation = qrSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        error: validation.error.errors[0].message,
      }, { status: 400 });
    }

    const { address, chain, amount, currency } = validation.data;

    // Generate EIP-681 URI
    let uri = `ethereum:${address}`;
    
    if (amount && currency) {
      // Convert amount to wei
      const amountWei = BigInt(parseFloat(amount) * 1e18).toString();
      uri += `?value=${amountWei}`;
    }

    // Sign the URI for verification
    const secret = process.env.BETTER_AUTH_SECRET || 'default-secret';
    const signature = createHmac('sha256', secret)
      .update(uri)
      .digest('hex');

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(uri, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });

    // Store QR code record
    const qrRecord = await prisma.qRCode.create({
      data: {
        userId: decoded.userId,
        address: address.toLowerCase(),
        chain,
        amount: amount ? parseFloat(amount) : null,
        currency,
        uri,
        imageUrl: qrDataUrl,
        signature,
        expiresAt: amount ? new Date(Date.now() + 60 * 60 * 1000) : null, // 1 hour for payment QRs
      },
    });

    return NextResponse.json({
      success: true,
      message: 'QR code generated successfully',
      qrCode: {
        id: qrRecord.id,
        uri,
        imageUrl: qrDataUrl,
        address,
        chain,
        amount,
        currency,
        signature,
      },
    });

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate QR code',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
