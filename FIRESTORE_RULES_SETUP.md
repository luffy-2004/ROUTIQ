# 🔐 FIRESTORE SECURITY RULES - SETUP INSTRUCTIONS

## ⚠️ Current Issue

You're getting "Missing or insufficient permissions" errors because the Firestore security rules don't allow the habit operations, especially for the subcollections.

## ✅ Solution: Update Security Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your **Routiq** project
3. Go to **Build** → **Firestore Database**
4. Click the **Rules** tab at the top

### Step 2: Replace All Rules

Delete everything currently in the Rules editor and paste this:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Tasks - users can manage their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Habits - users can manage their own habits AND subcollections
    match /habits/{habitId} {
      // Read/write habits only if user owns them
      allow read, write: if request.auth.uid == resource.data.userId;
      
      // Allow creating new habits with current user ID
      allow create: if request.auth.uid == request.resource.data.userId;
      
      // Allow users to read/write their habit completions subcollection
      match /completions/{document=**} {
        allow read, write: if request.auth.uid == get(/databases/$(database)/documents/habits/$(habitId)).data.userId;
      }
    }
    
    // Study sessions
    match /study_sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // AI workload reports - one document per day per user
    match /ai_reports/{reportId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Chat reflections/messages
    match /reflections/{messageId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Index tip: queries filtering by userId and ordering by createdAt may
    // require a composite index. Create one on collection `reflections`: 
    // userId (asc), createdAt (desc).
    
      // Index tip for ai_reports
      > **Index tip:** if you later query `ai_reports` by `userId` and `date` (for
      > example to show a history graph), Firestore will prompt you to create a
      > composite index. It's safe to pre-create one with:
      >
      >   - collection: `ai_reports`
      >   - fields: `userId` ascending, `date` descending
  }
}
```

### Step 3: Publish Rules

Click the **Publish** button in the bottom right corner.

⏳ Wait for confirmation that the rules have been deployed (usually takes 10-30 seconds).

### Step 4: Test

1. Go back to your app at `http://localhost:5173`
2. Refresh the page (Ctrl+R or Cmd+R)
3. Navigate to the Habits page
4. Try creating a new habit

✅ Should work now!

> **Tip:** you may see a console message saying "The query requires an index" when the app fetches sessions or habits. This happens when Firestore needs a composite index for a `where` + `orderBy` combination (e.g. filtering `study_sessions` by `userId` and sorting by `createdAt`).
> Simply click the blue link in the error message and follow the instructions, or manually create an index under Firestore → Indexes (collection `study_sessions`, fields `userId` ascending and `createdAt` descending).

---

## 📋 What These Rules Allow

| Operation | Allowed? | Why |
|-----------|----------|-----|
| Read own habits | ✅ Yes | User ID matches |
| Write own habits | ✅ Yes | User ID matches |
| Read others' habits | ❌ No | Security rule blocks |
| Write others' habits | ❌ No | Security rule blocks |
| Create completions | ✅ Yes | User owns the habit |
| Read completions | ✅ Yes | User owns the habit |
| Delete completions | ✅ Yes | User owns the habit |

---

## 🔍 Rule Explanation

### Habits Collection Rule
```firestore
match /habits/{habitId} {
  // Existing habits - only owner can read/write
  allow read, write: if request.auth.uid == resource.data.userId;
  
  // New habits - only creator can create with their ID
  allow create: if request.auth.uid == request.resource.data.userId;
```

### Completions Subcollection Rule
```firestore
match /completions/{document=**} {
  // Access allowed if user owns the parent habit
  allow read, write: if request.auth.uid == 
    get(/databases/$(database)/documents/habits/$(habitId)).data.userId;
}
```

This ensures:
- ✅ Users can only access their own habits
- ✅ Users can create completion records for their habits
- ✅ Other users cannot access their habit data

---

## 🛠️ Troubleshooting

### Still Getting Permission Errors?

1. **Check you're logged in** - Look at the header. You should see your email.

2. **Clear browser cache**
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear all data and reload

3. **Check Firebase credentials**
   - Ensure `src/firebase/firebase.js` has correct config
   - Verify the project ID matches your Firebase project

4. **Verify rules are published**
   - Go to Firebase Console → Firestore → Rules tab
   - Check the last deployed time
   - Should say "Published" not "Draft"

5. **Check browser console for errors**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for exact error message
   - Share it if you need help

### Query Errors (Index Required)

- If you encounter an error like `The query requires an index`, click the blue link provided in the console – it will prefill the index configuration for you.
- Or manually add a composite index:
  1. Go to Firestore → Indexes in the Firebase Console
  2. Click **Create Index**
  3. Set collection to `study_sessions`
  4. Add field `userId` (Ascending) and field `createdAt` (Descending)
  5. Create and wait for it to build, then refresh the app.

### Error: "Missing or insufficient permissions"
→ The security rules above don't match your collection structure  
→ Make sure you copied the exact rules  
→ Republish the rules

### Error: "Reference not found"
→ You haven't created any habits yet OR the completion rules reference doesn't exist  
→ Try creating a new habit first

---

## 📱 For Development (Test Mode)

If you're just testing and want to allow everything:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes - DEVELOPMENT ONLY!
    allow read, write: if true;
  }
}
```

⚠️ **WARNING**: Only use this for development! Always use proper security rules before deployment.

---

## ✅ Verification

After setting the rules and refreshing:

1. **Go to Habits page** - Should load without errors
2. **Create a habit** - Should appear in the list
3. **Mark as complete** - Should turn green
4. **Refresh page** - Data should persist
5. **Log out and log back in** - Habits should still be there

---

## 📞 Still Having Issues?

### Check These Files
- `src/firebase/firebase.js` - Has correct config? ✓
- `src/services/habitService.js` - Uses db correctly? ✓
- `src/pages/Habits.jsx` - Uses service correctly? ✓

### Common Issues Checklist
- [ ] Logged in with email/password (see header)
- [ ] Firestore rules are published (not draft)
- [ ] Rules include completions subcollection
- [ ] Browser cache cleared
- [ ] Page refreshed after rule changes
- [ ] No errors in browser console (F12)
- [ ] Firebase project has Firestore enabled

---

## 🎉 Once It Works

You should see:
- ✅ Habits page loads
- ✅ Form to add habits appears
- ✅ Can create habits
- ✅ Can mark as complete
- ✅ Streaks calculate automatically
- ✅ Data persists after refresh
- ✅ Dashboard shows habits

---

**Have questions?** Check [HABIT_TRACKING_GUIDE.md](./HABIT_TRACKING_GUIDE.md) for more details.
