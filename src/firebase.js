import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            'AIzaSyC20MmTitMfZEwW81__niRE8dfgj6gz3us',
  authDomain:        'action-and-bidding-platform.firebaseapp.com',
  projectId:         'action-and-bidding-platform',
  storageBucket:     'action-and-bidding-platform.firebasestorage.app',
  messagingSenderId: '896119664289',
  appId:             '1:896119664289:web:4421cf129d35cedacf8ae0',
};

// Guard against duplicate initialisation (hot-reload safe)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth          = getAuth(app);
export const db            = getFirestore(app);
export const storage       = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const getMessagingInstance = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export default app;
