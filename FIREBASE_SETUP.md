# Firebase Setup Guide for Routiq

## Quick Start

Follow these steps to set up Firebase for your Routiq application:

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "Routiq")
4. Accept the terms and click "Continue"
5. Disable Google Analytics (optional) and create the project

### Step 2: Create a Web App

1. In the Firebase project, click the Web icon (</>) to create a web app
2. Enter app name (e.g., "Routiq Web")
3. Check "Also set up Firebase Hosting" if desired
4. Click "Register app"

### Step 3: Copy Your Firebase Config

After registering, you'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
};
```

### Step 4: Update Firebase Configuration

1. Open `src/firebase/firebase.js`
2. Replace the `firebaseConfig` object with your credentials from Step 3
3. Save the file

### Step 5: Enable Authentication

1. In Firebase Console, go to "Build" > "Authentication"
2. Click "Get started"
3. Click "Email/Password" provider
4. Enable it and click "Save"

### Step 6: Create Firestore Database

1. In Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose your location and click "Next"
4. Start in "Test mode" for development (change to "Production mode" later)
5. Click "Create"

## Firestore Database Structure (Recommended)

```
users/
  ├── {userId}/
  │   ├── email: string
  │   ├── name: string
  │   ├── createdAt: timestamp
  │   └── preferences: object
  │   └── dailyAvailableMinutes: number   // optional, used by AI workload analysis (default 480)
  │   └── studyGoalMinutes: number       // optional, used by study tracker and profile settings

tasks/
  ├── {taskId}/
  │   ├── userId: string
  │   ├── title: string
  │   ├── estimatedTime: number
  │       // stored in minutes; frontend forms now accept hours:minutes and
  │       // convert back to total minutes before saving
  │   ├── priority: string
  │   ├── completed: boolean
  │   ├── createdAt: timestamp
  │   └── dueDate: timestamp

habits/
  ├── {habitId}/
  │   ├── userId: string
  │   ├── name: string
  │   ├── frequency: string
  │   ├── streak: number
  │   ├── lastCompleted: timestamp
  │   └── createdAt: timestamp

study_sessions/
  ├── {sessionId}/
  │   ├── userId: string
  │   ├── duration: number
  │   ├── subject: string
  │   ├── date: timestamp
  │   └── notes: string

reflections/
  ├── {messageId}/
      ├── userId: string (indexed)
      ├── role: string ('user'|'assistant')
      ├── text: string
      └── createdAt: timestamp
```

## Using Firebase in Your App

### Import Firebase Services

```javascript
import { auth, db } from './firebase/config';
```

### Authentication Example

```javascript
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase/config';

// Sign up
const signUp = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Sign in
const signIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Firestore Example

```javascript
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';

// Add a task
const addTask = async (userId, taskData) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      userId,
      ...taskData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding task:', error);
  }
};

// Get user's tasks
const getUserTasks = async (userId) => {
  try {
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};
```

## Security Rules (For Production)

Set these rules in Firebase Console > Firestore Database > Rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Tasks belong to users
    match /tasks/{taskId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Habits with subcollections for completions
    match /habits/{habitId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
      
      // Allow users to manage completion logs in subcollection
      match /completions/{document=**} {
        allow read, write: if request.auth.uid == get(/databases/$(database)/documents/habits/$(habitId)).data.userId;
      }
    }
    
    // Study sessions
    match /study_sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

**⚠️ IMPORTANT**: Copy this entire rule set and paste it into your Firebase Console. The subcollection rules for habits/completions are required for the habit tracking feature to work!

## Testing Firebase Connection

Add this to your App.jsx temporarily to test:

```javascript
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

useEffect(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User logged in:', user.email);
    } else {
      console.log('No user logged in');
    }
  });
}, []);
```

## Troubleshooting

**Issue: "Firebase: Error (auth/invalid-api-key)"**
- Check that your Firebase config credentials are correct
- Verify the API key is enabled in Firebase Console

**Issue: "Missing or insufficient permissions"**
- Ensure you're signed in with auth
- Check Firestore security rules allow the operation

**Issue: "Cannot find module 'firebase'"**
- Run `npm install firebase`
- Restart the dev server

## Next Steps

1. Implement the Login/Signup components with Firebase Auth
2. Add user context/state management for authentication
3. Create service functions for all CRUD operations
4. Implement error handling and loading states
5. Set up proper security rules before deployment

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs)
