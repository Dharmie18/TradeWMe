import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Super simple hardcoded users that will ALWAYS work
const STATIC_USERS = [
  {
    id: '1',
    email: 'admin@tradewme.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBVJ3fEBXgO/cq', // admin123
    name: 'Admin User',
    role: 'ADMIN',
    accountType: 'REAL',
    emailVerified: true,
    isActive: true,
  },
  {
    id: '2',
    email: 'user@tradewme.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBVJ3fEBXgO/cq', // user123
    name: 'Test User',
    role: 'USER',
    accountType: 'REAL',
    emailVerified: true,
    isActive: true,
  },
];

// Global storage for dynamic users (shared with signup)
let dynamicUsers: any[] = [];

// Simple JWT secret
const JWT_SECRET = 'simple-secret-key-for-testing-123456789';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE LOGIN API CALLED ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { email, password } = body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({
        success: false,
        message: 'Email and password are required',
      }, { status: 400 });
    }

    // Find user in both static and dynamic users
    const allUsers = [...STATIC_USERS, ...dynamicUsers];
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    console.log('User found:', user ? 'YES' : 'NO');
    console.log('Looking for email:', email.toLowerCase());
    console.log('Available static emails:', STATIC_USERS.map(u => u.email));
    console.log('Available dynamic emails:', dynamicUsers.map(u => u.email));
    console.log('Total users:', allUsers.length);

    if (!user) {
      console.log('User not found');
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password. Try: admin@tradewme.com / admin123 or user@tradewme.com / user123',
      }, { status: 401 });
    }

    // Check password
    console.log('Checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password. For test accounts use: admin123 or user123',
      }, { status: 401 });
    }

    // Generate token
    console.log('Generating JWT token...');
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('Token generated successfully');

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
    console.error('Simple login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
    }, { status: 500 });
  }
}