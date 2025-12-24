import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch all messages
export async function GET(req: NextRequest) {
    try {
        const messages = await db.getMessages();
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
        const { message, type, targetHostels, senderId, senderName, senderRole, hostelName } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        await db.addMessage({
            message,
            type: type || 'info',
            targetHostels: targetHostels || [], // Array of hostel names
            senderId,
            senderName,
            senderRole,
            hostelName // For student messages
        });
        return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
