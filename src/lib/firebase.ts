import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAHaRq5csdXspJ__F0aC3xK3SdQ0LWWqWU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'finzora-1ce5d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'finzora-1ce5d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'finzora-1ce5d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '337865929870',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:337865929870:web:29e807d3634485286dc5df',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-YCK23VKJ83',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

let analyticsInstance: Analytics | undefined;

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch(() => {
      analyticsInstance = undefined;
    });
}

export const getAnalyticsInstance = () => analyticsInstance;
