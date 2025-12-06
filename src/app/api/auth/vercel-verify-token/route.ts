import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth-utils';

// In-memory storage for Vercel (shared with login/signup)
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

// Handle both GET and POST requests
export async function GET(request: NextRequest) {
  return handleTokenVerification(request);
}

export async function POST(request: NextRequest) {
  return handleTokenVerification(request);
}

async function handleTokenVerification(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'No token provided',
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

    // Find user in memory
    const user = users.find(u => u.id === decoded.userId);

    if (!user || !user.isActive) {
      return NextResponse.json({
        success: false,
        message: 'User not found or inactive',
      }, { status: 401 });
    }

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
    console.error('Vercel token verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Token verification failed',
    }, { status: 500 });
  }
}