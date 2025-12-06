import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Simple JWT secret (same as login)
const JWT_SECRET = 'simple-secret-key-for-testing-123456789';

// Hardcoded users (same as login)
const USERS = [
  {
    id: '1',
    email: 'admin@tradewme.com',
    name: 'Admin User',
    role: 'ADMIN',
    accountType: 'REAL',
    emailVerified: true,
    isActive: true,
  },
  {
    id: '2',
    email: 'user@tradewme.com',
    name: 'Test User',
    role: 'USER',
    accountType: 'REAL',
    emailVerified: true,
    isActive: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE VERIFY API CALLED ===');
    
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header');
      return NextResponse.json({
        success: false,
        message: 'No token provided',
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted:', token.substring(0, 20) + '...');

    // Verify token
    console.log('Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Token decoded:', decoded);

    // Find user
    const user = USERS.find(u => u.id === decoded.userId);
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user || !user.isActive) {
      console.log('User not found or inactive');
      return NextResponse.json({
        success: false,
        message: 'User not found or inactive',
      }, { status: 401 });
    }

    console.log('Token verification successful for:', user.email);

    return NextResponse.json({
      success: true,
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
    console.error('Simple verify error:', error);
    return NextResponse.json({
      success: false,
      message: 'Token verification failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
    }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}