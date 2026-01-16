import { db } from '@/lib/db';
import { User } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        console.log('Login attempt started');
        const body = await req.json();
        console.log('Parsed body:', { id: body?.id, isDevOps: body?.isDevOps });

        const { id, password, isDevOps } = body;

        if (!id || !password) {
            console.log('Missing credentials');
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // Legacy DevOps/Email blocks removed to allow standard logins for all roles.
        console.log('Attempting db.findUser for id:', id);
        const user = await db.findUser(id);
        console.log('db.findUser result:', user ? 'Found' : 'Not Found');

        if (!user || user.password !== password) {
            console.log('Invalid credentials for id:', id);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        console.log('Login successful for role:', user.role);
        // In a real app, we would set a cookie/session here.
        // For this demo, we return the user data and let the frontend handle state.
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error: any) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: `Internal Server Error: [${error.message || 'Unknown'}] at ${new Date().toISOString()}` }, { status: 500 });
    }
}
