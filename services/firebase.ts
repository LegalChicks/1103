import * as firebaseApp from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Configuration priority:
// 1. window.__firebase_config (Injected by host environment)
// 2. process.env (Standard environment variables with various prefixes)
// 3. Fallback placeholders (Will cause auth errors if used)

const getFirebaseConfig = () => {
    const windowConfig = (window as any).__firebase_config;
    if (windowConfig) {
        // If it's a string, parse it; otherwise return the object
        return typeof windowConfig === 'string' ? JSON.parse(windowConfig) : windowConfig;
    }

    // Safe access to process.env
    let env: any = {};
    try {
        if (typeof process !== 'undefined' && process.env) {
            env = process.env;
        }
    } catch (e) {
        // process is not available
    }

    // Check for various common prefixes
    const apiKey = env.FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY;
    const authDomain = env.FIREBASE_AUTH_DOMAIN || env.REACT_APP_FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN;
    const projectId = env.FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID;
    const storageBucket = env.FIREBASE_STORAGE_BUCKET || env.REACT_APP_FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId = env.FIREBASE_MESSAGING_SENDER_ID || env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID;
    const appId = env.FIREBASE_APP_ID || env.REACT_APP_FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID;

    if (apiKey) {
        return {
            apiKey,
            authDomain,
            projectId,
            storageBucket,
            messagingSenderId,
            appId
        };
    }

    return {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
};

const firebaseConfig = getFirebaseConfig();

// Safe appId retrieval
const getAppId = () => {
    let env: any = {};
    try {
        if (typeof process !== 'undefined' && process.env) {
            env = process.env;
        }
    } catch (e) { }

    return (window as any).__app_id || 
           env.FIREBASE_APP_ID || 
           env.REACT_APP_FIREBASE_APP_ID || 
           env.VITE_FIREBASE_APP_ID || 
           'default-app-id';
}

export const appId = getAppId();


interface FirebaseServices {
    app: firebaseApp.FirebaseApp;
    auth: Auth;
    db: Firestore;
    storage: FirebaseStorage;
}

/**
 * Implements a comprehensive singleton pattern for Firebase services.
 * This prevents re-initialization errors in development environments
 * with Hot Module Replacement (HMR) by caching the initialized services
 * (app, auth, db) on the global `window` object.
 */
const getFirebaseServices = (): FirebaseServices => {
    if (!(window as any)._firebaseServices) {
        const app = firebaseApp.getApps().length > 0 ? firebaseApp.getApp() : firebaseApp.initializeApp(firebaseConfig);
        (window as any)._firebaseServices = {
            app: app,
            auth: getAuth(app),
            db: getFirestore(app),
            storage: getStorage(app),
        };
    }
    return (window as any)._firebaseServices;
};

const { auth, db, storage } = getFirebaseServices();

export { auth, db, storage };