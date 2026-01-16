import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, adminName } = body;

        if (!id || !adminName) {
            return NextResponse.json({ error: 'Entry ID and admin name required' }, { status: 400 });
        }

        const updated = await db.updateSickRegister(id, {
            status: 'cared',
            caredBy: adminName,
            caredAt: new Date().toISOString(),
        });

        if (!updated) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        // Send Push Notification
        try {
            const { sendPushToUser } = await import('@/lib/push-notifications');
            await sendPushToUser(updated.studentId, `Medical Alert Update`, `The warden has updated your medical emergency status to: CARED.`);
        } catch (pushError) {
            console.error('Failed to send push notification:', pushError);
        }

        return NextResponse.json({ success: true, entry: updated });
    } catch (error) {
        console.error('Mark as Cared Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
