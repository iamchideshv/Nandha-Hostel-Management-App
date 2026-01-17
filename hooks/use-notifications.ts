import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const VAPID_KEY = "BMnBcuLkhTVN8jHgWDIlQ6tIgLAZlNSJ1zn8rParQwx0pK-VZFqOhTz3PNsXSLEypNByOdJpnWz2NjPD0POYlWA";

export function useNotifications() {
    const { user } = useAuth();
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window === 'undefined' || !messaging || !user) return;

        setPermission(Notification.permission);

        const setupNotifications = async () => {
            try {
                // 1. Request Permission
                const permissionStatus = await Notification.requestPermission();
                setPermission(permissionStatus);

                if (permissionStatus !== 'granted') {
                    console.log('Notification permission denied');
                    return;
                }

                if (!messaging) return;

                // 2. Get Token
                const token = await getToken(messaging, {
                    vapidKey: VAPID_KEY
                });

                if (token) {
                    console.log('FCM Token received:', token);

                    // 3. Save to User Profile if not already there
                    const currentTokens = user.fcmTokens || [];
                    if (!currentTokens.includes(token)) {
                        await db.updateUserDetails(user.id, {
                            fcmTokens: [...currentTokens, token]
                        });
                    }
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }

                // 4. Listen for foreground messages
                onMessage(messaging, (payload) => {
                    console.log('Message received in foreground: ', payload);

                    const data = payload.data || {};

                    // 1. Private Message Check (Direct userId targeting)
                    if (data.recipientId && data.recipientId !== user.id) {
                        console.log('Ignoring private notification for different user:', data.recipientId);
                        return;
                    }

                    // 2. Role-based Broadcast Check
                    if (data.targetRole && data.targetRole !== user.role) {
                        console.log('Ignoring role-based notification for different role:', data.targetRole);
                        return;
                    }

                    // 3. Hostel-based Broadcast Check
                    if (data.targetHostel && data.targetHostel !== 'all' && data.targetHostel !== user.hostelName) {
                        console.log('Ignoring hostel-based notification for different hostel:', data.targetHostel);
                        return;
                    }

                    toast.info(payload.notification?.title || 'New Notification', {
                        description: payload.notification?.body,
                        duration: 5000,
                    });
                });

            } catch (error) {
                console.error('An error occurred while retrieving token:', error);
            }
        };

        setupNotifications();
    }, [user]);

    return { permission };
}
