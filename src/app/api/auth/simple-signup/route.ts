import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Global storage for new users (will persist during server runtime)
let dynamicUsers: any[] = [];

// Hardcoded test users
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

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE SIGNUP API CALLED ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { email, password, name } = body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({
        success: false,
        message: 'Email and password are required',
      }, { status: 400 });
    }

    if (password.length < 8) {
      console.log('Password too short');
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters long',
      }, { status: 400 });
    }

    // Check if user exists in static or dynamic users
    const allUsers = [...STATIC_USERS, ...dynamicUsers];
    const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    console.log('Checking for existing user:', email.toLowerCase());
    console.log('Existing user found:', existingUser ? 'YES' : 'NO');
    
    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json({
        success: false,
        message: 'Email already registered. Try logging in instead.',
      }, { status: 409 });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || 'User',
      role: 'USER',
      accountType: 'REAL',
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Add to dynamic users
    dynamicUsers.push(newUser);
    console.log('User created:', newUser.email);
    console.log('Total dynamic users:', dynamicUsers.length);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      userId: newUser.id,
      emailVerified: true,
    });

  } catch (error) {
    console.error('Simple signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Signup failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
    }, { status: 500 });
  }
}

// Export the users for the login endpoint
export { dynamicUsers, STATIC_USERS };