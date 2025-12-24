import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch all password reset requests
export async function GET(req: NextRequest) {
    try {
        const requests = await db.getPasswordResetRequests();
        return NextResponse.json(requests || []);
    } catch (error) {
        console.error('Error fetching password reset requests:', error);
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}

// POST: Submit a new password reset request
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, userName, userEmail } = body;

        if (!userId || !userName) {
            return NextResponse.json({ error: 'User details required' }, { status: 400 });
        }

        await db.submitPasswordResetRequest({ userId, userName, userEmail: userEmail || '' });
        return NextResponse.json({ success: true, message: 'Password reset request submitted' });
    } catch (error) {
        console.error('Error submitting password reset request:', error);
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }
}

// PUT: Update user password (DevOps only)
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, newPassword, requestId } = body;

        if (!userId || !newPassword) {
            return NextResponse.json({ error: 'User ID and new password required' }, { status: 400 });
        }

        await db.updateUserPassword(userId, newPassword);

        // Delete the reset request
        if (requestId) {
            await db.deletePasswordResetRequest(requestId);
        }

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
// DELETE: Manually delete a reset request (DevOps only)
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const requestId = searchParams.get('id');

        if (!requestId) {
            return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
        }

        await db.deletePasswordResetRequest(requestId);
        return NextResponse.json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting reset request:', error);
        return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
    }
}
