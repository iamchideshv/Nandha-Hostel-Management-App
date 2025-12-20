import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch user by ID or all users
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const user = await db.findUser(id);
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            return NextResponse.json(user);
        }

        // If no ID, fetch all users
        const users = await db.getUsers();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// PUT: Update user details
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, updates } = body;

        if (!id || !updates) {
            return NextResponse.json({ error: 'ID and updates required' }, { status: 400 });
        }

        if (updates.id && updates.id !== id) {
            // Changing the login ID/username
            await db.updateUserId(id, updates.id);
        } else {
            // General updates (name, password, etc.)
            await db.updateUserDetails(id, updates);
        }

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 400 });
    }
}

// DELETE: Remove a user
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await db.deleteUser(id);
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
