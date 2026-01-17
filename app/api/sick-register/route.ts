import { db } from '@/lib/db';
import { SickRegister } from '@/lib/types';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendPushToRole } from '@/lib/push-notifications';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const hostelName = searchParams.get('hostelName');

    try {
        const entries = await db.getSickRegisters(studentId || undefined, hostelName || undefined);
        return NextResponse.json(entries);
    } catch (error) {
        console.error('Sick Register GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            studentId,
            studentName,
            hostelName,
            roomNumber,
            collegeName,
            reason,
        } = body;

        if (!studentId || !studentName || !hostelName || !roomNumber || !collegeName || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newEntry: SickRegister = {
            id: uuidv4(),
            studentId,
            studentName,
            hostelName,
            roomNumber,
            collegeName,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            reason,
            status: 'pending',
            pushedToSheet: false,
            createdAt: new Date().toISOString(),
        };

        await db.addSickRegister(newEntry);

        // Send Push Notification to Admin
        try {
            await sendPushToRole(
                'admin',
                'Medical Emergency Alert 🚨',
                `${studentName} is requesting medical assistance in ${hostelName} - Room ${roomNumber}.`,
                { type: 'sick', id: newEntry.id },
                hostelName
            );
        } catch (pushError) {
            console.error('Failed to send push notification:', pushError);
        }

        return NextResponse.json(newEntry);
    } catch (error) {
        console.error('Sick Register POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
        }

        const updated = await db.updateSickRegister(id, updateData);
        if (!updated) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Sick Register PATCH Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const hostelName = searchParams.get('hostelName');
        const studentId = searchParams.get('studentId');

        await db.clearSickRegisters(hostelName || undefined, studentId || undefined);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Sick Register DELETE Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
