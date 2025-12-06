import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
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

function saveUsers(users: any[]) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
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

    // Get existing users
    const users = getUsers();

    // Check if user exists
    const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
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

    // Add user to list
    users.push(newUser);
    saveUsers(users);

    console.log('User created:', newUser.email);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      userId: newUser.id,
      emailVerified: true,
    });

  } catch (error) {
    console.error('Hybrid signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create account',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}