
import { getToken } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: 'BC7q-GqAK1RweCLjQc8ARgWzP-sfwVs3XgFsyKwWiov89PKuhzcqU57vR0PVf8WYB4thkUZYpChBpW9NgtgdaLM'
            });
            console.log('FCM Token:', token);
            return token;
        } else {
            console.log('Unable to get permission to notify.');
            return null;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return null;
    }
};

export const sendSystemNotification = (title: string, body: string) => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification(title, { body });
    }
};
