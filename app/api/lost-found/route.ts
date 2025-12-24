import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const hostelName = searchParams.get('hostelName');

    try {
        const items = await db.getLostFoundItems(studentId || undefined, hostelName || undefined);
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { studentId, studentName, hostelName, roomNumber, productName, identification, location, timeAndDate, image } = body;

        const newItem = {
            id: uuidv4(),
            studentId,
            studentName,
            hostelName,
            roomNumber,
            productName,
            identification,
            location,
            timeAndDate,
            image, // Expecting Base64 string
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        await db.addLostFoundItem(newItem);
        return NextResponse.json(newItem);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, status, adminMessage } = body;

        // Fetch existing item
        const items = await db.getLostFoundItems();
        const existingItem = items.find(i => i.id === id);

        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const updatedItem = {
            ...existingItem,
            status,
            adminMessage: adminMessage || existingItem.adminMessage
        };

        await db.addLostFoundItem(updatedItem);
        return NextResponse.json(updatedItem);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const hostelName = searchParams.get('hostelName');
        const studentId = searchParams.get('studentId');
        await db.clearLostFoundItems(hostelName || undefined, studentId || undefined);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
