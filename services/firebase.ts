
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This configuration is a placeholder and will be replaced by the build environment.
// It's structured this way to align with the provided HTML file's script block.
const firebaseConfig = {
  apiKey: "AIzaSyDrYsymJX_-cTaLwVOEqlcqp8lkl34Sxks",
  authDomain: "g1105project.firebaseapp.com",
  projectId: "g1105project",
  storageBucket: "g1105project.firebasestorage.app",
  messagingSenderId: "743351398371",
  appId: "1:743351398371:web:7009efd89913f802bf7ad6",
  measurementId: "G-8V8P7T4TEZ"
};

export const appId = (window as any).__app_id || 'default-app-id';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
