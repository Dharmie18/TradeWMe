import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Verification token is required',
        error: 'MISSING_TOKEN',
      }, { status: 400 });
    }

    // Find token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json({
        success: false,
        message: 'Invalid verification token',
        error: 'INVALID_TOKEN',
      }, { status: 404 });
    }

    // Check if already used
    if (verificationToken.used) {
      return NextResponse.json({
        success: false,
        message: 'This verification link has already been used',
        error: 'TOKEN_USED',
      }, { status: 400 });
    }

    // Check if expired
    if (new Date() > verificationToken.expiresAt) {
      return NextResponse.json({
        success: false,
        message: 'Verification link has expired. Please request a new one.',
        error: 'TOKEN_EXPIRED',
      }, { status: 400 });
    }

    // Verify user
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: verificationToken.userId,
        action: 'email_verified',
        entity: 'user',
        entityId: verificationToken.userId,
        newData: {
          emailVerified: true,
          verifiedAt: new Date(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    // Redirect to login with success message
    const redirectUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?verified=true`;
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify email',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
