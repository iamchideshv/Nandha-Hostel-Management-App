import { db } from './db';
import { firebaseAdmin } from './firebase-admin';



export async function sendPushToUser(userId: string, title: string, body: string, data?: any) {
    const user = await db.findUser(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        throw new Error('NO_DEVICE_TOKENS_FOUND');
    }

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
    if (!tokens.length) return;

    const message = {
        tokens: tokens,
        notification: {
            title,
            body,
        },
        data: data || {},
        webpush: {
            notification: {
                icon: '/icon-192.png',
            },
            fcmOptions: {
                link: '/'
            }
        },
        android: {
            notification: {
                icon: '/icon-192.png',
                clickAction: '/'
            }
        }
    };

    try {
        const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
        console.log('FCM Send result:', response);

        if (response.failureCount > 0) {
            const firstError = response.responses.find(r => !r.success)?.error;
            if (firstError) {
                // Log all errors for debugging
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        console.error(`Error sending to token ${tokens[idx]}:`, resp.error);
                    }
                });
                throw new Error(`FCM_ERROR: ${firstError.message}`);
            }
        }

        return response;
    } catch (error) {
        console.error('Error sending FCM message:', error);
        throw error;
    }
}
