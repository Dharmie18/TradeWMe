// =============================================================================
// AUTH UTILITIES - JWT Verification & Token Management
// =============================================================================

import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  accountType: 'REAL' | 'DEMO';
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT token and return decoded payload
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const secret = process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    
    if (!secret) {
      console.error('JWT secret not configured');
      return null;
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Generate JWT token
 */
export function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    throw new Error('JWT secret not configured');
  }

  return jwt.sign(
    payload,
    secret,
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

/**
 * Verify and decode token from request header
 */
export function verifyAuthHeader(authHeader: string | null): JWTPayload | null {
  const token = extractToken(authHeader);
  if (!token) return null;
  
  return verifyJWT(token);
}
