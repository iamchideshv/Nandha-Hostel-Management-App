import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch all messages
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const hostelName = searchParams.get('hostelName');
        const messages = await db.getMessages(hostelName || undefined);
        return NextResponse.json(messages || []);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// POST: Send a new message
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, type, targetHostels, targetStudentId, senderId, senderName, senderRole, hostelName } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        await db.addMessage({
            message,
            type: type || 'info',
            targetHostels: targetHostels || [], // Array of hostel names
            senderId: senderId || 'unknown',
            senderName: senderName || 'Unknown',
            senderRole: senderRole || 'student',
            targetStudentId: targetStudentId || null,
            hostelName: hostelName || null // Ensure null if undefined, Firestore crashes on undefined
        });

        // Send Push Notification if urgent or private
        try {
            const { sendPushToUser, sendPushToRole, sendPushToAll } = await import('@/lib/push-notifications');

            if (type === 'app-update') {
                await sendPushToAll('App Update 🚀', message, { url: '/' });
            } else if (targetStudentId) {
                await sendPushToUser(targetStudentId, `Message from ${senderName}`, message, { recipientId: targetStudentId });
            } else if (type === 'urgent') {
                await sendPushToRole('admin', `URGENT: ${senderName}`, message);
                await sendPushToRole('authority', `URGENT: ${senderName}`, message);
            }
        } catch (pushError) {
            console.error('Failed to send push notification:', pushError);
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

// DELETE: Clear messages by role
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role'); // 'student' or 'admin'

        if (!role) {
            return NextResponse.json({ error: 'Role parameter is required' }, { status: 400 });
        }

        await db.deleteMessagesByRole(role);
        return NextResponse.json({ success: true, message: `${role} messages cleared` });
    } catch (error) {
        console.error('Error deleting messages:', error);
        return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
    }
}
