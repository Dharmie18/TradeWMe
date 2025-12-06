import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateJWT } from '@/lib/auth-utils';
import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const USERS_FILE = join(process.cwd(), 'users.json');

function getUsers() {
  if (!existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
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

    // Get users from file
    const users = getUsers();

    // Find user
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    console.log('Hybrid login attempt for:', email.toLowerCase());
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Total users in file:', users.length);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'No account found with this email. Please check your email or create a new account.',
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
    console.error('Hybrid login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}