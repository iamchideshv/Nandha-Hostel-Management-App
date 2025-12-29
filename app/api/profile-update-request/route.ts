import { db } from '@/lib/db';
import { ProfileUpdateRequest } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const requests = await db.getProfileUpdateRequests();
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { studentId, studentName, fieldName } = body;

        const newRequest: ProfileUpdateRequest = {
            id: Math.random().toString(36).substring(2, 9),
            studentId,
            studentName,
            fieldName,
            requestDate: new Date().toISOString(),
            status: 'pending'
        };

        await db.addProfileUpdateRequest(newRequest);
        return NextResponse.json(newRequest);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await db.deleteProfileUpdateRequest(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
    }
}
