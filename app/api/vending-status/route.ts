import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch current vending machine status
export async function GET(req: NextRequest) {
    try {
        const status = await db.getVendingStatus();
        return NextResponse.json(status || {
            status: 'operational',
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching vending status:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}

// POST: Save/Update vending machine status
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        await db.saveVendingStatus({ status });
        return NextResponse.json({ success: true, message: 'Vending status updated successfully' });
    } catch (error) {
        console.error('Error saving vending status:', error);
        return NextResponse.json({ error: 'Failed to save status' }, { status: 500 });
    }
}
