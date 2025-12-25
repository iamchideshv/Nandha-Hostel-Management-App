import { db } from '@/lib/db';
import { Feedback } from '@/lib/types';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const feedback = await db.getFeedback();
        return NextResponse.json(feedback);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { studentId, studentName, hostelName, rating, message } = body;

        const newFeedback: Feedback = {
            id: uuidv4(),
            studentId,
            studentName,
            hostelName,
            rating,
            message,
            createdAt: new Date().toISOString(),
        };

        await db.addFeedback(newFeedback);
        return NextResponse.json(newFeedback);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
