// =============================================================================
// EMAIL SERVICE - SendGrid Integration
// =============================================================================

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@trade-w-me.vercel.app',
    subject: 'Verify your TradeWMe account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">TradeWMe</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome${name ? `, ${name}` : ''}!</h2>
          
          <p>Thank you for signing up with TradeWMe. Please verify your email address to access your dashboard and start trading.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            ${verificationUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">
            <strong>This link expires in 24 hours.</strong><br>
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name?: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@trade-w-me.vercel.app',
    subject: 'Reset your TradeWMe password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">TradeWMe</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          
          <p>Hi${name ? ` ${name}` : ''},</p>
          
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            ${resetUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">
            <strong>This link expires in 1 hour.</strong><br>
            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send deposit confirmation email
 */
export async function sendDepositConfirmationEmail(
  email: string,
  amount: string,
  currency: string,
  txHash: string,
  name?: string
): Promise<void> {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@trade-w-me.vercel.app',
    subject: 'Deposit Confirmed - TradeWMe',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deposit Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">TradeWMe</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">✅ Deposit Confirmed!</h2>
          
          <p>Hi${name ? ` ${name}` : ''},</p>
          
          <p>Your deposit has been successfully confirmed and credited to your account.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666;">Amount:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${amount} ${currency}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666;">Transaction:</td>
                <td style="padding: 10px 0; text-align: right; font-size: 12px; word-break: break-all;">${txHash.slice(0, 10)}...${txHash.slice(-8)}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">
            You can now start trading with your deposited funds.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Deposit confirmation email sent to ${email}`);
  } catch (error) {
    console.error('SendGrid error:', error);
    // Don't throw error for confirmation emails
    console.warn('Failed to send deposit confirmation email, but deposit was successful');
  }
}
