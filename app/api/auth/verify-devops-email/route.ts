import { NextRequest, NextResponse } from 'next/server';
import { storeVerificationCode } from '@/lib/verification-store';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code with 10 minute expiration
        storeVerificationCode(email, code, 10 * 60 * 1000);

        // In production, send email here using SendGrid, AWS SES, or Nodemailer
        console.log(`[DevOps Verification] Code for ${email}: ${code}`);

        return NextResponse.json({
            success: true,
            message: 'Verification code sent',
            // For testing only - remove in production
            __devCode: process.env.NODE_ENV === 'development' ? code : undefined
        });
    } catch (error) {
        console.error('Error sending verification code:', error);
        return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
    }
}
