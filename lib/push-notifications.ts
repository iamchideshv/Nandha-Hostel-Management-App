import { db } from './db';

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY; // I'll advise the user to add this

export async function sendPushToUser(userId: string, title: string, body: string, data?: any) {
    const user = await db.findUser(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    return sendToTokens(user.fcmTokens, title, body, data);
}

export async function sendPushToRole(role: string, title: string, body: string, data?: any) {
    const users = await db.getUsers();
    const targetUsers = users.filter(u => u.role === role);
    const allTokens = targetUsers.flatMap(u => u.fcmTokens || []);

    if (allTokens.length === 0) return;
    return sendToTokens(allTokens, title, body, data);
}

async function sendToTokens(tokens: string[], title: string, body: string, data?: any) {
    if (!FCM_SERVER_KEY) {
        console.warn('FCM_SERVER_KEY is not defined in environment variables');
        return;
    }

    const payload = {
        registration_ids: tokens,
        notification: {
            title,
            body,
            icon: '/icon-192.png',
            click_action: '/',
        },
        data: data || {}
    };

    try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Authorization': `key=${FCM_SERVER_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('FCM Send result:', result);
        return result;
    } catch (error) {
        console.error('Error sending FCM message:', error);
    }
}
