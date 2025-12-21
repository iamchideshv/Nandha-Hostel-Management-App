import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getVerificationCode, deleteVerificationCode } from '@/lib/verification-store';

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
        }

        const storedData = getVerificationCode(email);

        if (!storedData) {
            return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
        }

        // Check expiration
        if (Date.now() > storedData.expiresAt) {
            deleteVerificationCode(email);
            return NextResponse.json({ error: 'Verification code expired. Please request a new one.' }, { status: 400 });
        }

        // Verify code
        if (storedData.code !== code) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        // Code is valid, check if DevOps user exists
        const users = await db.getUsers();
        const devopsUser = users.find(
            (u: any) => u.role === 'devops' && u.email?.toLowerCase() === email.toLowerCase()
        );

        if (!devopsUser) {
            return NextResponse.json({ error: 'DevOps user not found' }, { status: 404 });
        }

        // Clear the verification code
        deleteVerificationCode(email);

        return NextResponse.json({
            success: true,
            user: {
                id: devopsUser.id,
                email: devopsUser.email,
                role: 'devops'
            }
        });
    } catch (error) {
        console.error('Error verifying code:', error);
        return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
    }
}
