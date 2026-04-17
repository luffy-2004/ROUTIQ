
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBuQMGpKkp4ahtU0Lc91kaPJPyfuEJ7ev8",
  authDomain: "routiq-95f89.firebaseapp.com",
  projectId: "routiq-95f89",
  storageBucket: "routiq-95f89.firebasestorage.app",
  messagingSenderId: "665489491135",
  appId: "1:665489491135:web:3845eee258521c39c5b20a",
  measurementId: "G-5KSQ21ZCY2"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export app instance for other uses
export default app;
