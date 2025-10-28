// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, otpCode } = await request.json();

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    // Find user with matching email and valid OTP
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        resetPasswordToken: otpCode,
        resetPasswordExpires: {
          gt: new Date(), // OTP not expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    console.log(`✅ OTP verified for: ${user.email}`);

    // OTP valid, tapi jangan clear dulu - masih perlu untuk reset password
    return NextResponse.json({
      message: 'OTP verified successfully',
      success: true,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}