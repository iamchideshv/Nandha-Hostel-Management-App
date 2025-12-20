
import { NextResponse } from 'next/server';
import { BUILD_ID } from '@/lib/build-id';

export async function GET() {
    return NextResponse.json({ buildId: BUILD_ID });
}
