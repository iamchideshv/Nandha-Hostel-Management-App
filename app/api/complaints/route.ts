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
        const { studentId, studentName, hostelName, type, title, description } = body;

        const newComplaint: Complaint = {
            id: uuidv4(),
            studentId,
            studentName,
            hostelName,
            type,
            title,
            description,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        await db.addComplaint(newComplaint);
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
        await db.clearComplaints(hostelName || undefined);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
