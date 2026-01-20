import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'List of IDs required' }, { status: 400 });
        }

        // Delete users in a loop
        // If your db provider supports bulk delete, use that instead.
        const deletePromises = ids.map(id => db.deleteUser(id));
        await Promise.all(deletePromises);

        return NextResponse.json({ message: `${ids.length} users deleted successfully` });
    } catch (error) {
        console.error('Error in bulk deleting users:', error);
        return NextResponse.json({ error: 'Failed to delete some users' }, { status: 500 });
    }
}
