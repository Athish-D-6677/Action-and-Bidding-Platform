import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from '../firebase';
import api from '../api';
import toast from 'react-hot-toast';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export function useFCM(userId) {
  useEffect(() => {
    if (!userId) return;

    let unsubscribe;

    (async () => {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          await api.post('/auth/notifications/fcm-token', { token }).catch(() => {});
        }

        unsubscribe = onMessage(messaging, payload => {
          const { title, body } = payload.notification || {};
          if (title) toast(body ? `${title}: ${body}` : title);
        });
      } catch {
        // Push is non-critical — fail silently
      }
    })();

    return () => unsubscribe?.();
  }, [userId]);
}
