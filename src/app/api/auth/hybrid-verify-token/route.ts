import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth-utils';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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

    // Get users from file
    const users = getUsers();

    // Find user
    const user = users.find((u: any) => u.id === decoded.userId);

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
    console.error('Hybrid token verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Token verification failed',
    }, { status: 500 });
  }
}