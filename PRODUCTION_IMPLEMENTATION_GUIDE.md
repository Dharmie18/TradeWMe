# 🚀 Production Trading Platform - Complete Implementation Guide

## Overview

This guide implements a **fully auditable, production-ready** trading platform with:
- ✅ Email verification (no dashboard access without verification)
- ✅ Wallet connection (dashboard only, balance = 0 on connect)
- ✅ Real blockchain verification with valid QR codes
- ✅ Real-time price feeds (WebSocket/SSE)
- ✅ Mobile-responsive trading charts
- ✅ **Transparent simulation mode** (demo accounts only, fully logged)
- ✅ Admin audit logs (every action tracked)
- ✅ Security & rate limiting

## ⚠️ CRITICAL: NO HIDDEN MANIPULATION

**This platform implements ZERO hidden profit manipulation for real accounts.**

- Real accounts (`accountType: REAL`) always show real computed profits
- Demo accounts (`accountType: DEMO`) can have simulation mode enabled by admin
- All simulation adjustments are:
  - ✅ Logged in audit trail
  - ✅ Visible to user (banner: "Simulation Mode Active")
  - ✅ Reversible and traceable
  - ✅ Admin-controlled with reason required

---

## 📋 Phase 1: Setup & Dependencies

### 1.1 Install Required Packages

```bash
cd tradewme

# Core dependencies
npm install @prisma/client prisma
npm install bcryptjs jsonwebtoken
npm install nodemailer @sendgrid/mail
npm install ethers viem
npm install qrcode
npm install ws socket.io socket.io-client
npm install zod
npm install rate-limiter-flexible

# Dev dependencies
npm install -D @types/bcryptjs @types/jsonwebtoken @types/nodemailer @types/qrcode @types/ws
```

### 1.2 Initialize Prisma

```bash
npx prisma init
# Copy schema.prisma content (already created)
npx prisma generate
npx prisma db push
```

### 1.3 Environment Variables

Copy `.env.example` to `.env` and fill in all values.

**Priority order for account creation:**
1. ✅ Alchemy (blockchain verification)
2. ✅ SendGrid (email verification)
3. ✅ WalletConnect (wallet integration)
4. ✅ CoinGecko (price data)
5. ✅ Supabase/Railway (PostgreSQL database)

---

## 📋 Phase 2: Email Verification System

### 2.1 Create Email Service

**File:** `src/lib/email.ts`

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Verify your TradeWMe account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to TradeWMe${name ? `, ${name}` : ''}!</h2>
        <p>Please verify your email address to access your dashboard.</p>
        <p>
          <a href="${verificationUrl}" 
             style="background: #0070f3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p>Or copy this link: ${verificationUrl}</p>
        <p><small>This link expires in 24 hours.</small></p>
        <hr>
        <p><small>If you didn't create this account, please ignore this email.</small></p>
      </div>
    `,
  };

  await sgMail.send(msg);
}
```

### 2.2 Signup API Route

**File:** `src/app/api/auth/signup/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';

const prisma = new PrismaClient();

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: validation.error.errors[0].message,
      }, { status: 400 });
    }

    const { email, password, name } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Email already registered',
        error: 'EMAIL_EXISTS',
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        emailVerified: false,
        accountType: 'REAL', // Default to REAL account
      },
    });

    // Generate verification token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token, name);

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_signup',
        entity: 'user',
        entityId: user.id,
        newData: {
          email: user.email,
          accountType: user.accountType,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      userId: user.id,
      verificationEmailSent: true,
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create account',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
```

### 2.3 Email Verification API Route

**File:** `src/app/api/auth/verify/route.ts`

```typescript
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
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?verified=true`
    );

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify email',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
```

---

## 📋 Phase 3: Login with Email Verification Check

**File:** `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        error: validation.error.errors[0].message,
      }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS',
      }, { status: 401 });
    }

    // CRITICAL: Check email verification
    if (!user.emailVerified) {
      return NextResponse.json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        error: 'EMAIL_NOT_VERIFIED',
        emailVerified: false,
      }, { status: 403 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS',
      }, { status: 401 });
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        error: 'ACCOUNT_DEACTIVATED',
      }, { status: 403 });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    // Create session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_login',
        entity: 'user',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountType: user.accountType,
        emailVerified: user.emailVerified,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
```

---

## 📋 Phase 4: Wallet Connection (Dashboard Only, Balance = 0)

**File:** `src/app/api/wallet/connect/route.ts`

```typescript
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
    await prisma.balance.upsert({
      where: {
        userId_currency: {
          userId: decoded.userId,
          currency: chain === 'ethereum' ? 'ETH' : chain === 'bsc' ? 'BNB' : 'MATIC',
        },
      },
      update: {},
      create: {
        userId: decoded.userId,
        currency: chain === 'ethereum' ? 'ETH' : chain === 'bsc' ? 'BNB' : 'MATIC',
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
```

---

## 📋 Phase 5: QR Code Generation

**File:** `src/app/api/qr/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import { createHmac } from 'crypto';
import { verifyJWT } from '@/lib/auth-utils';
import { z } from 'zod';

const prisma = new PrismaClient();

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
    const signature = createHmac('sha256', process.env.QR_SECRET_SALT!)
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
```

---

## 📋 Next Steps

This is Part 1 of the implementation. The guide continues with:

**Part 2:**
- Deposit verification with blockchain
- Real-time price feeds (WebSocket)
- Admin panel with audit logs
- Simulation mode (demo accounts only)

**Part 3:**
- Frontend integration
- Mobile-responsive charts
- Testing guide
- Deployment checklist

Would you like me to continue with Part 2?

---

**Status:** Part 1 Complete ✅
**Next:** Deposit verification & real-time prices
