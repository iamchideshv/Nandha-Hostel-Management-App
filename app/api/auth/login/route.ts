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

        // --- Master DevOps Login ---
        if (id === 'chideshtanya11@gmail.com') {
            if (password === '9944847680') {
                const devopsUser: User = {
                    id: 'chideshtanya11@gmail.com',
                    name: 'DevOps Admin',
                    role: 'devops',
                    email: 'chideshtanya11@gmail.com'
                };
                return NextResponse.json(devopsUser);
            } else {
                return NextResponse.json({ error: 'Access Denied' }, { status: 401 });
            }
        }

        // If it's a DevOps login attempt but not the master account, strictly deny
        if (isDevOps) {
            return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
        }

        // If an email is used that is NOT the master DevOps email, deny access
        if (id.includes('@')) {
            return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
        }

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
