import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateJWT } from '@/lib/auth-utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// In-memory storage for Vercel (shared with signup)
// In production, this would be replaced with a database
let users: any[] = [];

// Pre-populate with test users if empty
if (users.length === 0) {
  users = [
    {
      id: '1',
      email: 'admin@tradewme.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBVJ3fEBXgO/cq', // admin123
      name: 'Admin User',
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      accountType: 'REAL',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'user@tradewme.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBVJ3fEBXgO/cq', // user123
      name: 'Test User',
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      accountType: 'REAL',
      role: 'USER',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

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

    // Find user in memory
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    console.log('Vercel login attempt for:', email.toLowerCase());
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Total users in memory:', users.length);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'No account found with this email. Try creating an account first, or use test accounts: admin@tradewme.com (admin123) or user@tradewme.com (user123)',
        error: 'USER_NOT_FOUND',
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Incorrect password. Please check your password and try again.',
        error: 'INVALID_PASSWORD',
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
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
    });

    console.log('Login successful for:', user.email);

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
    console.error('Vercel login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}