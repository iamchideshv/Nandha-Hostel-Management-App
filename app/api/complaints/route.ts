import { db } from '@/lib/db';
import { Complaint } from '@/lib/types';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type');

    const hostelName = searchParams.get('hostelName');

    // Fetch only relevant complaints from DB
    let complaints = await db.getComplaints(studentId || undefined, hostelName || undefined);

    if (type) {
        complaints = complaints.filter(c => c.type === type);
    }

    // Sort by date desc
    complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(complaints);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { studentId, studentName, hostelName, type, title, description, roomNumber, collegeName } = body;

        const newComplaint: Complaint = {
            id: uuidv4(),
            studentId,
            studentName,
            hostelName,
            roomNumber: roomNumber || '',
            collegeName: collegeName || '',
            type,
            title,
            description,
            status: 'pending',
            pushedToSheet: false,
            createdAt: new Date().toISOString(),
        };


        await db.addComplaint(newComplaint);

        // Notify Admin of New Complaint
        try {
            const { sendPushToRole } = await import('@/lib/push-notifications');
            await sendPushToRole(
                'admin',
                'New Complaint 📝',
                `${studentName} reported: ${title}`,
                { type: 'complaint', id: newComplaint.id },
                hostelName
            );
        } catch (pushError) {
            console.error('Failed to send push notification:', pushError);
        }

        return NextResponse.json(newComplaint);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, status } = body;

        const updatedComplaint = await db.updateComplaintStatus(id, status);
        if (!updatedComplaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }
        return NextResponse.json(updatedComplaint);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const hostelName = searchParams.get('hostelName');
        const studentId = searchParams.get('studentId');
        await db.clearComplaints(hostelName || undefined, studentId || undefined);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
