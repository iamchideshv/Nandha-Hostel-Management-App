import { db } from '@/lib/db';
import { User, UserRole } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, password, name, hostelName, roomNumber, secretCode } = body;

        // Check mandatory fields (ID, Password, Name are common)
        if (!id || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await db.findUser(id);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        let role: UserRole = 'student';

        // Check for Secret Code to assign specific roles
        if (secretCode) {
            if (secretCode === '7680') {
                role = 'admin';
            } else if (secretCode === '8696') {
                role = 'send-off';
            } else {
                return NextResponse.json({ error: 'Invalid Secret Code' }, { status: 403 });
            }
        }

        const newUser: User = {
            id,
            password,
            name,
            role,
            hostelName: hostelName || (role === 'admin' ? 'Administrative' : 'Main Hostel'),
            roomNumber: roomNumber || '',
            feesPaid: false,
        };

        await db.addUser(newUser);

        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Register API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
