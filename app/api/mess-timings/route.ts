import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'boys';
        const timings = await db.getMessTimings(type);
        return NextResponse.json(timings || {
            breakfast: '7:30 AM - 9:00 AM',
            lunch: '12:30 PM - 2:00 PM',
            snacks: '4:30 PM - 5:30 PM',
            dinner: '7:30 PM - 9:00 PM'
        });
    } catch (error) {
        console.error('Error fetching mess timings:', error);
        return NextResponse.json({ error: 'Failed to fetch timings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'boys';
        const timingData = await req.json();

        await db.saveMessTimings(timingData, type);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving mess timings:', error);
        return NextResponse.json({ error: 'Failed to save timings' }, { status: 500 });
    }
}
