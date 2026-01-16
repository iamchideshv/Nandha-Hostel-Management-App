import { db } from '@/lib/db';
import { User } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, password, isDevOps } = body;

        if (!id || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }



        // Legacy DevOps/Email blocks removed to allow standard logins for all roles.

        const user = await db.findUser(id);

        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // In a real app, we would set a cookie/session here.
        // For this demo, we return the user data and let the frontend handle state.
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
