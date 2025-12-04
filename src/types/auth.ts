// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  verificationEmailSent?: boolean;
  error?: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  email?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
    accountType: 'REAL' | 'DEMO';
    emailVerified: boolean;
  };
  error?: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
  error?: string;
}
