import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateJWT } from '@/lib/auth-utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Mock users for testing (remove in production)
const mockUsers = [
  {
    id: '1',
    email: 'admin@tradewme.com',
    name: 'Admin User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBVJ3fEBXgO/cq', // password: admin123
    role: 'ADMIN',
    accountType: 'REAL' as const,
    emailVerified: true,
    isActive: true,
  },
  {
    id: '2',
    email: 'user@tradewme.com',
    name: 'Test User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBVJ3fEBXgO/cq', // password: user123
    role: 'USER',
    accountType: 'REAL' as const,
    emailVerified: true,
    isActive: true,
  },
];

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

    // Find mock user
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    console.log('Mock login attempt for:', email.toLowerCase());
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'No account found with this email. Try: admin@tradewme.com (password: admin123) or user@tradewme.com (password: user123)',
        error: 'USER_NOT_FOUND',
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Incorrect password. Try: admin123 for admin@tradewme.com or user123 for user@tradewme.com',
        error: 'INVALID_PASSWORD',
      }, { status: 401 });
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
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
    console.error('Mock login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}