# 🚨 QUICK FIX - Permission Errors

## The Problem
You're seeing "Missing or insufficient permissions" on the Habits page and Dashboard because Firestore security rules don't allow the habit operations.

## The Solution (2 minutes)

### Step 1: Open Firebase Console
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select your **Routiq** project
3. Click **Firestore Database**
4. Click **Rules** tab

### Step 2: Copy & Paste New Rules
Delete everything and paste this:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /tasks/{taskId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    match /habits/{habitId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
      
      match /completions/{document=**} {
        allow read, write: if request.auth.uid == get(/databases/$(database)/documents/habits/$(habitId)).data.userId;
      }
    }
    
    match /study_sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // ai_reports (workload analysis)
    match /ai_reports/{reportId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // reflections/chat messages
    match /reflections/{messageId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Step 3: Publish
Click **Publish** button in bottom right.

⏳ Wait for "Successfully published" message.

### Step 4: Refresh Browser
1. Go to `http://localhost:5173`
2. Press **Ctrl+R** (Windows) or **Cmd+R** (Mac)
3. Refresh again if needed (cache)

### Step 5: Test
1. Go to **Habits** page
2. Click **"+ Add Habit"**
3. Create a habit
4. Should work now! ✅

---

## Key Changes Made
✅ Added subcollection rules for `completions`  
✅ Allows users to manage their habit completion logs  
✅ Maintains security (only access own habits)

---

## Still Not Working?
1. Check you're **logged in** (see header with email)
2. **Clear cache**: Ctrl+Shift+Delete then reload
3. Check browser console (F12) for exact error
4. Verify rules are **Published** (not Draft)

---

See [FIRESTORE_RULES_SETUP.md](./FIRESTORE_RULES_SETUP.md) for detailed explanation.
