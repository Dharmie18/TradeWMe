import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

// In-memory storage for Vercel (will reset on each deployment)
// In production, this would be replaced with a database
let users: any[] = [];

// Pre-populate with some test users
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
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
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
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || 'User',
      emailVerified: true, // Auto-verify for now
      emailVerifiedAt: new Date().toISOString(),
      accountType: 'REAL',
      role: 'USER',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    // Add user to memory
    users.push(newUser);

    console.log('User created:', newUser.email);
    console.log('Total users:', users.length);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      userId: newUser.id,
      emailVerified: true,
    });

  } catch (error) {
    console.error('Vercel signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create account',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}