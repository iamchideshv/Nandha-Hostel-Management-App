import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, adminName } = body;

        if (!id || !adminName) {
            return NextResponse.json({ error: 'Entry ID and admin name required' }, { status: 400 });
        }

        const updated = await db.updateSickRegister(id, {
            status: 'cared',
            caredBy: adminName,
            caredAt: new Date().toISOString(),
        });

        if (!updated) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, entry: updated });
    } catch (error) {
        console.error('Mark as Cared Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
