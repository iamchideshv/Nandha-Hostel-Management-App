import { db } from '@/lib/db';
import { Outpass } from '@/lib/types';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const outpassId = searchParams.get('outpassId');

  const hostelName = searchParams.get('hostelName');

  // If requesting specific outpass by ID, return just that one
  if (outpassId) {
    const all = await db.getOutpasses();
    const outpass = all.find(o => o.id === outpassId);
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
      hostelName // Add this
    } = body;

    const newOutpass: Outpass = {
      id: uuidv4(),
      studentId,
      studentName,
      reason,
      fromDate,
      toDate,
      collegeName,
      roomNumber,
      yearAndDept,
      hostelName, // Save this
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await db.addOutpass(newOutpass);
    return NextResponse.json(newOutpass);
  } catch (error) {
    console.error('Outpass POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const updated = await db.updateOutpassStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Outpass not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hostelName = searchParams.get('hostelName');
    await db.clearOutpasses(hostelName || undefined);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
