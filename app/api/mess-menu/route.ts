import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch current mess menu
export async function GET(req: NextRequest) {
    try {
        const menu = await db.getMessMenu();
        return NextResponse.json(menu || {
            breakfast: Array(7).fill('Not Set'),
            lunch: Array(7).fill('Not Set'),
            snacks: Array(7).fill('Not Set'),
            dinner: Array(7).fill('Not Set')
        });
    } catch (error) {
        console.error('Error fetching mess menu:', error);
        return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
    }
}

// POST: Save/Update mess menu
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { breakfast, lunch, snacks, dinner } = body;

        if (!breakfast || !lunch || !snacks || !dinner) {
            return NextResponse.json({ error: 'Invalid menu data' }, { status: 400 });
        }

        await db.saveMessMenu({ breakfast, lunch, snacks, dinner });
        return NextResponse.json({ success: true, message: 'Menu uploaded successfully' });
    } catch (error) {
        console.error('Error saving mess menu:', error);
        return NextResponse.json({ error: 'Failed to save menu' }, { status: 500 });
    }
}
