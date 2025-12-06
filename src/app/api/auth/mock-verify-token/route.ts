import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth-utils';

// Mock users for testing (same as mock-login)
const mockUsers = [
  {
    id: '1',
    email: 'admin@tradewme.com',
    name: 'Admin User',
    role: 'ADMIN',
    accountType: 'REAL' as const,
    emailVerified: true,
    isActive: true,
  },
  {
    id: '2',
    email: 'user@tradewme.com',
    name: 'Test User',
    role: 'USER',
    accountType: 'REAL' as const,
    emailVerified: true,
    isActive: true,
  },
];

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

    // Find mock user
    const user = mockUsers.find(u => u.id === decoded.userId);

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
    console.error('Mock token verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Token verification failed',
    }, { status: 500 });
  }
}