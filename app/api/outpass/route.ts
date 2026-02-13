import { db } from '@/lib/db';
import { Outpass } from '@/lib/types';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendPushToRole } from '@/lib/push-notifications';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const outpassId = searchParams.get('outpassId');

  const hostelName = searchParams.get('hostelName');

  // If requesting specific outpass by ID, return just that one
  if (outpassId) {
    const outpass = await db.getOutpassById(outpassId);
    if (!outpass) {
      return NextResponse.json({ error: 'Outpass not found' }, { status: 404 });
    }
    return NextResponse.json(outpass);
  }

  // Optimized fetch with server-side filtering
  const outpasses = await db.getOutpasses(studentId || undefined, hostelName || undefined);

  // Sort by date desc
  outpasses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(outpasses);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentId,
      studentName,
      reason,
      fromDate,
      toDate,
      collegeName,
      roomNumber,
      yearAndDept,
      hostelName, // Add this
      outTime,
      inTime,
      inDate,
      type
    } = body;

    const newOutpass: Outpass = {
      id: uuidv4(),
      studentId,
      studentName,
      reason,
      fromDate,
      toDate: toDate || fromDate, // Fallback
      outTime,
      inTime,
      inDate,
      type: type || 'outpass',
      collegeName,
      roomNumber,
      yearAndDept,
      hostelName, // Save this
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await db.addOutpass(newOutpass);

    // Send Push Notification to Admin
    try {
      await sendPushToRole(
        'admin',
        'New Outpass Request 📄',
        `${studentName} is requesting ${type} until ${toDate}.`,
        { type: 'outpass', id: newOutpass.id },
        hostelName
      );
    } catch (pushError) {
      console.error('Failed to send push notification:', pushError);
    }

    return NextResponse.json(newOutpass);
  } catch (error) {
    console.error('Outpass POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    const updated = await db.updateOutpass(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Outpass not found' }, { status: 404 });
    }

    // Send Push Notification on status change or approval
    try {
      if (updateData.status || updateData.approvedAt) {
        const { sendPushToUser } = await import('@/lib/push-notifications');
        const statusMsg = updateData.status === 'approved' ? 'APPROVED! 🎉' :
          updateData.status === 'rejected' ? 'REJECTED ❌' :
            updateData.status === 'exited' ? 'MARKED AS EXITED' :
              updateData.status;

        await sendPushToUser(updated.studentId, `Outpass Update`, `Your outpass request has been ${statusMsg}.`);
      }
    } catch (pushError) {
      console.error('Failed to send push notification:', pushError);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');

    if (ids) {
      const idList = ids.split(',').filter(Boolean);
      await db.deleteOutpassesByIds(idList);
      return NextResponse.json({ success: true });
    }

    const hostelName = searchParams.get('hostelName');
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type');
    const collegeName = searchParams.get('collegeName');

    await db.clearOutpasses(
      hostelName || undefined,
      studentId || undefined,
      type || undefined,
      collegeName || undefined
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
