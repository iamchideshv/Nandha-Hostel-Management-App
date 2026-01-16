import { NextRequest, NextResponse } from 'next/server';
import { sendPushToUser, sendPushToRole } from '@/lib/push-notifications';

export async function POST(req: NextRequest) {
    try {
        const { userId, role, title, body, data } = await req.json();

        if (userId) {
            await sendPushToUser(userId, title, body, data);
        } else if (role) {
            await sendPushToRole(role, title, body, data);
        } else {
            return NextResponse.json({ error: 'Either userId or role is required' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
