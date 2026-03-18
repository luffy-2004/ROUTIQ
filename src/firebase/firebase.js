/**
 * Firebase Configuration
 * 
 * To set up Firebase:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project
 * 3. Create a web app in the project
 * 4. Copy your Firebase config object from the app settings
 * 5. Replace the firebaseConfig object below with your credentials
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAw_o-85YkASif3BQy7eyhGeubzJoXS_0",
  authDomain: "routiq-756a9.firebaseapp.com",
  projectId: "routiq-756a9",
  storageBucket: "routiq-756a9.firebasestorage.app",
  messagingSenderId: "745684823315",
  appId: "1:745684823315:web:88a84fe8bb9c9e55273ee6",
  measurementId: "G-QQKQLZP9JG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Export app instance for other uses
export default app;
