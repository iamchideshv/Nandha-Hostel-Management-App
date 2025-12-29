
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Limit the fields that can be updated for security
        // In a real app, strict validation is needed
        // Here we allow updating the fields requested
        const allowedUpdates = ['name', 'department', 'roomNumber', 'email', 'phoneNumber', 'profileImage'];
        const updateData: any = {};

        for (const key of Object.keys(data)) {
            if (allowedUpdates.includes(key)) {
                updateData[key] = data[key];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
        }

        await db.updateUserDetails(id, updateData);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Error updating profile:', e);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
