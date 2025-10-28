// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json({
        message: 'If the email exists, a verification code has been sent',
      });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 600000); // 10 minutes

    // Save OTP to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: otpCode,
        resetPasswordExpires: otpExpiry,
      },
    });

    // Send email with OTP
    const emailHtml = generateOTPEmail(otpCode, user.name);

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Kode Verifikasi Reset Password - RS Panti Nugroho',
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      );
    }

    console.log(`✅ OTP sent to ${user.email}: ${otpCode}`); // Log untuk development

    return NextResponse.json({
      message: 'If the email exists, a verification code has been sent',
      success: true,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateOTPEmail(otpCode: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
          }
          .email-wrapper {
            background-color: #f3f4f6;
            padding: 40px 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #10b981, #059669); 
            padding: 40px 30px; 
            text-align: center; 
            color: white; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.95;
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #059669;
            margin: 0 0 20px 0;
          }
          .intro-text {
            color: #4b5563;
            margin: 0 0 30px 0;
            font-size: 15px;
          }
          .otp-section {
            text-align: center;
            margin: 40px 0;
          }
          .otp-label {
            font-size: 13px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          .otp-box {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border: 3px solid #10b981;
            border-radius: 12px;
            padding: 25px;
            display: inline-block;
            margin: 10px 0;
          }
          .otp-code {
            font-size: 42px;
            font-weight: 700;
            color: #047857;
            letter-spacing: 10px;
            font-family: 'Courier New', Consolas, monospace;
            user-select: all;
            -webkit-user-select: all;
            -moz-user-select: all;
            -ms-user-select: all;
          }
          .copy-hint {
            font-size: 13px;
            color: #065f46;
            margin-top: 12px;
            font-weight: 500;
          }
          .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            margin: 30px 0;
            border-radius: 6px;
          }
          .warning-box strong {
            color: #92400e;
            display: block;
            margin-bottom: 5px;
          }
          .warning-box p {
            margin: 0;
            color: #78350f;
            font-size: 14px;
          }
          .security-note {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 16px 20px;
            margin: 20px 0;
            text-align: center;
          }
          .security-note p {
            margin: 0;
            color: #991b1b;
            font-size: 14px;
            font-weight: 600;
          }
          .help-text {
            color: #6b7280;
            font-size: 14px;
            margin: 30px 0 0 0;
            line-height: 1.6;
          }
          .footer { 
            background: #f9fafb;
            text-align: center; 
            padding: 30px 20px;
            color: #6b7280; 
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 5px 0;
          }
          @media only screen and (max-width: 600px) {
            .content {
              padding: 30px 20px;
            }
            .otp-code {
              font-size: 36px;
              letter-spacing: 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <h1>🏥 RS Panti Nugroho</h1>
              <p>KAWAN DIABETES</p>
            </div>
            
            <div class="content">
              <p class="greeting">Halo, ${userName}!</p>
              
              <p class="intro-text">
                Kami menerima permintaan untuk mereset password akun Anda.
                Gunakan kode verifikasi di bawah ini untuk melanjutkan proses reset password.
              </p>
              
              <div class="otp-section">
                <div class="otp-label">KODE VERIFIKASI ANDA</div>
                <div class="otp-box">
                  <div class="otp-code">${otpCode}</div>
                </div>
                <div class="copy-hint">
                  👆 Ketik atau copy kode di atas
                </div>
              </div>
              
              <div class="warning-box">
                <strong>⏰ Perhatian:</strong>
                <p>Kode ini hanya berlaku selama <strong>10 menit</strong>. Segera gunakan kode ini sebelum kadaluarsa.</p>
              </div>

              <div class="security-note">
                <p>🔒 Jangan bagikan kode ini kepada siapapun, termasuk petugas RS!</p>
              </div>
              
              <p class="help-text">
                Jika Anda tidak melakukan permintaan reset password, abaikan email ini. 
                Password Anda akan tetap aman dan tidak akan berubah.
              </p>
            </div>
            
            <div class="footer">
              <p><strong>RS Panti Nugroho - Kawan Diabetes</strong></p>
              <p>© 2025 Semua hak dilindungi</p>
              <p style="margin-top: 15px; color: #9ca3af; font-size: 12px;">
                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}