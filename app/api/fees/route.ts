import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { FeeStatus } from '@/lib/types';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type'); // 'requests' | 'all'

    try {
        if (studentId) {
            const status = await db.getFeeStatus(studentId);
            return NextResponse.json(status || { status: 'none' });
        }

        if (type === 'requests') {
            let requests = await db.getAllFeeRequests();
            const hostelName = searchParams.get('hostelName');
            if (hostelName) {
                requests = requests.filter(r => r.hostelName === hostelName);
            }
            return NextResponse.json(requests);
        }

        // Default: get all for admin list
        let all = await db.getAllFees();
        const hostelName = searchParams.get('hostelName');
        if (hostelName) {
            all = all.filter(f => f.hostelName === hostelName);
        }
        return NextResponse.json(all);

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, ...data } = body;

        // action: 'request' | 'update'

        if (action === 'request') {
            const { studentId, studentName, hostelName } = data;
            const newRecord: FeeStatus = {
                id: studentId,
                studentId,
                studentName,
                hostelName,
                status: 'pending_request',
                lastUpdated: new Date().toISOString()
            };
            await db.updateFeeStatus(newRecord);
            return NextResponse.json({ success: true, data: newRecord });
        }

        if (action === 'update') {
            // Admin updating status
            const updatedRecord: FeeStatus = {
                ...data,
                lastUpdated: new Date().toISOString()
            };
            await db.updateFeeStatus(updatedRecord);
            return NextResponse.json({ success: true, data: updatedRecord });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const hostelName = searchParams.get('hostelName');
        await db.clearFeeRequests(hostelName || undefined);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
