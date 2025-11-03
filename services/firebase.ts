
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This configuration is a placeholder and will be replaced by the build environment.
// It's structured this way to align with the provided HTML file's script block.
const firebaseConfig = JSON.parse(
  (window as any).__firebase_config ||
    `{
      "apiKey": "YOUR_API_KEY",
      "authDomain": "YOUR_AUTH_DOMAIN",
      "projectId": "YOUR_PROJECT_ID",
      "storageBucket": "YOUR_STORAGE_BUCKET",
      "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
      "appId": "YOUR_APP_ID"
    }`
);

export const appId = (window as any).__app_id || 'default-app-id';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
