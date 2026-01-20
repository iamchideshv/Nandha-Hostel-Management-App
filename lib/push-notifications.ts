import { db } from './db';
import { firebaseAdmin } from './firebase-admin';



export async function sendPushToUser(userId: string, title: string, body: string, data?: any) {
    const user = await db.findUser(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        throw new Error('NO_DEVICE_TOKENS_FOUND');
    }

    // Include recipientId in data for client-side filtering
    const notificationData = {
        ...(data || {}),
        recipientId: userId
    };

    return sendToTokens(user.fcmTokens, title, body, notificationData);
}

export async function sendPushToRole(role: string, title: string, body: string, data?: any, hostelName?: string) {
    const users = await db.getUsers();
    let targetUsers = users.filter(u => u.role === role);

    if (hostelName) {
        // Target users who have the role AND (either match the hostel OR have no hostel assigned/marked 'all')
        targetUsers = targetUsers.filter(u =>
            !u.hostelName ||
            u.hostelName === 'all' ||
            u.hostelName === hostelName
        );
    }

    const allTokens = targetUsers.flatMap(u => u.fcmTokens || []);

    if (allTokens.length === 0) {
        console.log(`No tokens found for role: ${role}${hostelName ? ` in hostel: ${hostelName}` : ''}`);
        return;
    }

    // Include target info in data for client-side filtering
    const notificationData = {
        ...(data || {}),
        targetRole: role,
        targetHostel: hostelName || 'all'
    };

    return sendToTokens(allTokens, title, body, notificationData);
}

export async function sendPushToAll(title: string, body: string, data?: any) {
    const users = await db.getUsers();
    // Get ALL tokens from ALL users
    const allTokens = users.flatMap(u => u.fcmTokens || []);

    if (allTokens.length === 0) return;
    return sendToTokens(allTokens, title, body, data);
}



async function sendToTokens(tokens: string[], title: string, body: string, data?: any) {
    if (!firebaseAdmin.apps.length) {
        const missing = [];
        if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
        if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
        if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');

        throw new Error(`Server Config Error: Firebase Admin not initialized. Missing env vars: ${missing.join(', ') || 'Unknown error'}`);
    }

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
        console.log('FCM Send result summary:', {
            successCount: response.successCount,
            failureCount: response.failureCount
        });

        if (response.failureCount > 0) {
            // Log errors but don't necessarily throw if at least one succeeded
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`Error sending to token ${tokens[idx].substring(0, 10)}... :`, resp.error);
                }
            });

            // Only throw if ALL failed and we expected to send something
            if (response.successCount === 0 && tokens.length > 0) {
                const firstError = response.responses.find(r => !r.success)?.error;
                throw new Error(`FCM_ALL_FAILED: ${firstError?.message || 'Unknown error'}`);
            }
        }

        return response;
    } catch (error) {
        console.error('Error in sendToTokens:', error);
        throw error;
    }
}
